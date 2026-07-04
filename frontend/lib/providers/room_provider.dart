import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';
import '../models/track.dart';
import '../services/api_service.dart';
import '../services/media_session_stub.dart'
    if (dart.library.js) '../services/media_session_web.dart' as ms;

enum ConnectionStateEnum { disconnected, connecting, connected }

class RoomProvider extends ChangeNotifier {
  String? _roomCode;
  ConnectionStateEnum _connectionState = ConnectionStateEnum.disconnected;
  WebSocketChannel? _channel;
  StreamSubscription? _wsSubscription;
  StreamSubscription? _ytSubscription;
  
  // Room state from server
  Track? _activeTrack;
  bool _isPlaying = false;
  List<Track> _queue = [];
  int _memberCount = 0;

  // Local state
  double _localPlaybackPosition = 0.0;
  double _localDuration = 0.0;
  bool _isVideoMode = false; // Video on/off toggle
  
  // YouTube player controller
  late YoutubePlayerController _youtubeController;

  // Getters
  String? get roomCode => _roomCode;
  ConnectionStateEnum get connectionState => _connectionState;
  Track? get activeTrack => _activeTrack;
  bool get isPlaying => _isPlaying;
  double get playbackPosition => _localPlaybackPosition;
  double get duration => _localDuration;
  List<Track> get queue => _queue;
  int get memberCount => _memberCount;
  bool get isVideoMode => _isVideoMode;
  YoutubePlayerController get youtubeController => _youtubeController;

  RoomProvider() {
    _initYoutubeController();
  }

  void _initYoutubeController() {
    _youtubeController = YoutubePlayerController(
      params: const YoutubePlayerParams(
        showControls: false,
        showFullscreenButton: false,
        mute: false,
        showVideoAnnotations: false,
        playsInline: true,
      ),
    );

    // Listen to video state changes
    _ytSubscription = _youtubeController.videoStateStream.listen((state) {
      final newPos = state.position.inMilliseconds / 1000.0;
      final newDur = _youtubeController.metadata.duration.inMilliseconds / 1000.0;
      bool changed = false;
      
      if ((newPos - _localPlaybackPosition).abs() > 0.1) {
        _localPlaybackPosition = newPos;
        changed = true;
      }
      if ((newDur - _localDuration).abs() > 0.1) {
        _localDuration = newDur;
        changed = true;
      }
      if (changed) {
        notifyListeners();
      }
    });

  }


  void toggleVideoMode() {
    _isVideoMode = !_isVideoMode;
    notifyListeners();
  }

  // Connect to room WebSocket
  Future<void> connectToRoom(String code) async {
    if (_channel != null) {
      await disconnect();
    }
    
    _roomCode = code.toUpperCase();
    _connectionState = ConnectionStateEnum.connecting;
    notifyListeners();

    final wsUrl = "${ApiService.baseWsUrl}/rooms/ws/$_roomCode";
    debugPrint("Connecting to WS: $wsUrl");

    try {
      _channel = WebSocketChannel.connect(Uri.parse(wsUrl));
      _connectionState = ConnectionStateEnum.connected;
      notifyListeners();

      _wsSubscription = _channel!.stream.listen(
        (message) {
          _handleWsMessage(message);
        },
        onError: (err) {
          debugPrint("WebSocket error: $err");
          _handleDisconnect();
        },
        onDone: () {
          debugPrint("WebSocket closed");
          _handleDisconnect();
        },
      );
    } catch (e) {
      debugPrint("WebSocket connection exception: $e");
      _handleDisconnect();
    }
  }

  void _handleDisconnect() {
    _connectionState = ConnectionStateEnum.disconnected;
    _channel = null;
    _wsSubscription?.cancel();
    _wsSubscription = null;
    notifyListeners();
  }

  Future<void> disconnect() async {
    _roomCode = null;
    _activeTrack = null;
    _isPlaying = false;
    _localPlaybackPosition = 0.0;
    _queue = [];
    _memberCount = 0;
    
    _wsSubscription?.cancel();
    _wsSubscription = null;
    _channel?.sink.close();
    _channel = null;
    
    _connectionState = ConnectionStateEnum.disconnected;
    _updateMediaSession();
    notifyListeners();
  }

  // Handle incoming websocket updates
  void _handleWsMessage(String message) {
    try {
      final payload = jsonDecode(message);
      final type = payload['type'];
      
      if (type == 'sync') {
        final state = payload['state'];
        if (state == null) return;
        final rawTrack = state['active_track'];
        final newTrack = rawTrack != null ? Track.fromJson(rawTrack) : null;
        final newIsPlaying = state['is_playing'] ?? false;
        final double newPosition = (state['position'] as num?)?.toDouble() ?? 0.0;
        final List<dynamic> rawQueue = state['queue'] ?? [];
        final newQueue = rawQueue.map((item) => Track.fromJson(item)).toList();
        final newMemberCount = state['member_count'] ?? 1;

        _memberCount = newMemberCount;
        _queue = newQueue;

        _syncPlayback(newTrack, newIsPlaying, newPosition);
      }
    } catch (e) {
      debugPrint("Error parsing WebSocket message: $e");
    }
  }

  // Playback syncing logic with drift compensation
  Future<void> _syncPlayback(Track? newTrack, bool newIsPlaying, double newPosition) async {
    final trackChanged = _activeTrack?.youtubeId != newTrack?.youtubeId;
    
    _activeTrack = newTrack;
    _isPlaying = newIsPlaying;

    if (newTrack == null) {
      _youtubeController.cueVideoById(videoId: "");
      _localPlaybackPosition = 0.0;
      notifyListeners();
      return;
    }

    if (trackChanged) {
      debugPrint("Loading new video: ${newTrack.youtubeId} at $newPosition seconds");
      _localPlaybackPosition = newPosition;
      await _youtubeController.loadVideoById(
        videoId: newTrack.youtubeId,
        startSeconds: newPosition,
      );
      if (!newIsPlaying) {
        await _youtubeController.pauseVideo();
      } else {
        await _youtubeController.playVideo();
      }
    } else {
      // Reconcile play/pause state
      if (newIsPlaying) {
        await _youtubeController.playVideo();
      } else {
        await _youtubeController.pauseVideo();
      }

      // Reconcile position drift (seek if diff > 3.0s and player is playing, to avoid infinite buffer loop)
      if (_youtubeController.value.playerState == PlayerState.playing) {
        final drift = (newPosition - _localPlaybackPosition).abs();
        if (drift > 3.0) {
          debugPrint("Playback drift ($drift seconds) exceeds threshold. Seeking to: $newPosition");
          _localPlaybackPosition = newPosition;
          await _youtubeController.seekTo(seconds: newPosition, allowSeekAhead: true);
        }
      }
    }
    _updateMediaSession();
    notifyListeners();
  }

  void _updateMediaSession() {
    ms.updateMediaSession(_activeTrack, _roomCode, _isPlaying, setPlayState);
  }

  // Client triggers (send commands to WebSocket)
  void playTrack(Track track) {
    if (_channel == null) return;
    
    final payload = {
      "type": "play",
      "track": track.toJson(),
      "position": 0.0
    };
    _channel!.sink.add(jsonEncode(payload));
  }

  void setPlayState(bool play) {
    if (_channel == null || _activeTrack == null) return;
    
    final payload = {
      "type": play ? "play" : "pause",
      "track": _activeTrack!.toJson(),
      "position": _localPlaybackPosition
    };
    _channel!.sink.add(jsonEncode(payload));
  }

  void togglePlay() {
    setPlayState(!_isPlaying);
  }

  void seekTo(double seconds) {
    if (_channel == null || _activeTrack == null) return;
    
    _localPlaybackPosition = seconds;
    final payload = {
      "type": "seek",
      "position": seconds
    };
    _channel!.sink.add(jsonEncode(payload));
    notifyListeners();
  }

  void addToQueue(Track track) {
    if (_channel == null) return;
    
    final payload = {
      "type": "queue_add",
      "track": track.toJson()
    };
    _channel!.sink.add(jsonEncode(payload));
  }

  void removeFromQueue(String youtubeId) {
    if (_channel == null) return;
    
    final payload = {
      "type": "queue_remove",
      "youtube_id": youtubeId
    };
    _channel!.sink.add(jsonEncode(payload));
  }

  void playFromQueue(int index) {
    if (_channel == null) return;
    
    final payload = {
      "type": "queue_play",
      "index": index
    };
    _channel!.sink.add(jsonEncode(payload));
  }

  @override
  void dispose() {
    _wsSubscription?.cancel();
    _ytSubscription?.cancel();
    _channel?.sink.close();
    super.dispose();
  }
}
