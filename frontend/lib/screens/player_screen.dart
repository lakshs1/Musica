import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';
import '../models/track.dart';
import '../providers/room_provider.dart';
import '../services/api_service.dart';
import 'home_screen.dart';

class PlayerScreen extends StatefulWidget {
  const PlayerScreen({super.key});

  @override
  State<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends State<PlayerScreen> {
  double? _dragValue;

  String _formatDuration(double seconds) {
    if (seconds.isNaN || seconds.isInfinite || seconds <= 0) return "00:00";
    final int totalSeconds = seconds.round();
    final int minutes = totalSeconds ~/ 60;
    final int remainingSeconds = totalSeconds % 60;
    return "${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}";
  }

  void _showSearchSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const SearchBottomSheet(),
    );
  }

  void _showRoomMenu(BuildContext context, RoomProvider provider) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF16151A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 8),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(Icons.copy_rounded, color: Color(0xFF6366F1)),
                title: Text(
                  "Room Code: ${provider.roomCode}",
                  style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600),
                ),
                subtitle: Text(
                  "Tap to copy code to share with friends",
                  style: GoogleFonts.inter(color: Colors.white54, fontSize: 12),
                ),
                onTap: () {
                  Clipboard.setData(ClipboardData(text: provider.roomCode ?? ''));
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      backgroundColor: const Color(0xFF6366F1),
                      content: Text(
                        "Room code copied to clipboard!",
                        style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600),
                      ),
                    ),
                  );
                },
              ),
              const Divider(color: Colors.white10),
              ListTile(
                leading: const Icon(Icons.people_alt_rounded, color: Colors.white70),
                title: Text(
                  "Active Listeners",
                  style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600),
                ),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    "${provider.memberCount}",
                    style: GoogleFonts.outfit(
                      color: const Color(0xFF6366F1),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                subtitle: Text(
                  "Number of people currently in sync",
                  style: GoogleFonts.inter(color: Colors.white54, fontSize: 12),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<RoomProvider>(context);
    final track = provider.activeTrack;

    return Scaffold(
      backgroundColor: const Color(0xFF0F0E13),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.exit_to_app_rounded, color: Colors.white),
          onPressed: () {
            provider.disconnect();
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (_) => const HomeScreen()),
            );
          },
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(6),
              ),
              clipBehavior: Clip.antiAlias,
              child: Image.asset(
                'assets/logo.png',
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              "Musync",
              style: GoogleFonts.outfit(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                letterSpacing: 1.0,
              ),
            ),
          ],
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.search_rounded, color: Colors.white),
            onPressed: () => _showSearchSheet(context),
          ),
          IconButton(
            icon: const Icon(Icons.more_vert_rounded, color: Colors.white),
            onPressed: () => _showRoomMenu(context, provider),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Background soft lights
          Positioned(
            top: 40,
            left: MediaQuery.of(context).size.width * 0.1,
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF6366F1).withOpacity(0.08),
              ),
            ),
          ),
          
          // Main Body Scrollable View
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Player / Cover Card (Stack above AspectRatio) - Always static children to prevent platform view reset!
                  Stack(
                    children: [
                      // Underlay YouTube Player (always running at 16:9, never resized/unmounted)
                      AspectRatio(
                        aspectRatio: 16 / 9,
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.white10),
                          ),
                          clipBehavior: Clip.antiAlias,
                          child: YoutubePlayer(controller: provider.youtubeController),
                        ),
                      ),
                      
                      // Cover Overlay - Always present in the tree to prevent platform view reset!
                      Positioned.fill(
                        child: IgnorePointer(
                          ignoring: provider.isVideoMode && track != null,
                          child: AnimatedOpacity(
                            opacity: (provider.isVideoMode && track != null) ? 0.0 : 1.0,
                            duration: const Duration(milliseconds: 250),
                            child: Container(
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F0E13), // Match scaffold background
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Center(
                                child: RotatingDisc(
                                  thumbnailUrl: track?.thumbnail ?? '',
                                  isPlaying: provider.isPlaying,
                                  size: 160, // Sized to fit perfectly inside 16:9 container
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                
                // Track metadata or Empty placeholder
                if (track == null) ...[
                  Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const SizedBox(height: 24),
                        Text(
                          "No Active Track",
                          style: GoogleFonts.outfit(
                            color: Colors.white70,
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          "Search and select a video to play",
                          style: GoogleFonts.inter(
                            color: Colors.white30,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ] else ...[
                  // Song Title
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          track.title,
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.outfit(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "Synchronized Playback",
                          style: GoogleFonts.inter(
                            color: const Color(0xFF6366F1),
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // Slider & Time Label
                  Column(
                    children: [
                      SliderTheme(
                        data: SliderTheme.of(context).copyWith(
                          activeTrackColor: const Color(0xFF6366F1),
                          inactiveTrackColor: Colors.white10,
                          thumbColor: Colors.white,
                          overlayColor: const Color(0xFF6366F1).withOpacity(0.2),
                          trackHeight: 4,
                          thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                        ),
                        child: Slider(
                          value: _dragValue ?? provider.playbackPosition.clamp(0.0, provider.duration == 0 ? 0.0 : provider.duration),
                          min: 0.0,
                          max: provider.duration == 0 ? 100.0 : provider.duration,
                          onChanged: (val) {
                            setState(() {
                              _dragValue = val;
                            });
                          },
                          onChangeEnd: (val) {
                            provider.seekTo(val);
                            setState(() {
                              _dragValue = null;
                            });
                          },
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              _formatDuration(_dragValue ?? provider.playbackPosition),
                              style: GoogleFonts.inter(color: Colors.white54, fontSize: 12),
                            ),
                            Text(
                              _formatDuration(provider.duration),
                              style: GoogleFonts.inter(color: Colors.white54, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  
                  // Play / Pause Controls
                  Center(
                    child: GestureDetector(
                      onTap: provider.togglePlay,
                      child: Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFF6366F1),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF6366F1).withOpacity(0.4),
                              blurRadius: 20,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: Icon(
                          provider.isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                          size: 40,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
                
                const SizedBox(height: 40),
                
                // Video Mode Toggle Switch
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.03),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withOpacity(0.05)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(
                            provider.isVideoMode ? Icons.videocam_rounded : Icons.music_note_rounded,
                            color: provider.isVideoMode ? const Color(0xFF6366F1) : Colors.white70,
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Video Mode",
                                style: GoogleFonts.inter(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14,
                                ),
                              ),
                              Text(
                                provider.isVideoMode ? "Showing live video" : "Audio-only playback",
                                style: GoogleFonts.inter(
                                  color: Colors.white30,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Switch(
                        value: provider.isVideoMode,
                        onChanged: (val) => provider.toggleVideoMode(),
                        activeColor: const Color(0xFF6366F1),
                        activeTrackColor: const Color(0xFF6366F1).withOpacity(0.3),
                        inactiveThumbColor: Colors.white60,
                        inactiveTrackColor: Colors.white10,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        ),
        
        // No duplicate player needed here as the primary player is kept mounted at size 0.1
        ],
      ),
    );
  }
}

// Rotating Vinyl Disc Visualizer Widget
class RotatingDisc extends StatefulWidget {
  final String thumbnailUrl;
  final bool isPlaying;
  final double size;

  const RotatingDisc({
    super.key,
    required this.thumbnailUrl,
    required this.isPlaying,
    this.size = 240,
  });

  @override
  State<RotatingDisc> createState() => _RotatingDiscState();
}

class _RotatingDiscState extends State<RotatingDisc> with SingleTickerProviderStateMixin {
  late AnimationController _rotationController;

  @override
  void initState() {
    super.initState();
    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 15),
    );

    if (widget.isPlaying) {
      _rotationController.repeat();
    }
  }

  @override
  void didUpdateWidget(covariant RotatingDisc oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isPlaying != oldWidget.isPlaying) {
      if (widget.isPlaying) {
        _rotationController.repeat();
      } else {
        _rotationController.stop();
      }
    }
  }

  @override
  void dispose() {
    _rotationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _rotationController,
      builder: (context, child) {
        return Transform.rotate(
          angle: _rotationController.value * 2 * 3.1415926535,
          child: child,
        );
      },
      child: Center(
        child: Container(
          width: widget.size,
          height: widget.size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: const Color(0xFF070709),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.6),
                blurRadius: 30,
                spreadRadius: 5,
              ),
              BoxShadow(
                color: const Color(0xFF6366F1).withOpacity(0.1),
                blurRadius: 40,
                spreadRadius: 2,
              ),
            ],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Vinyl Grooves effect
              Container(
                margin: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white.withOpacity(0.03), width: 2),
                ),
              ),
              Container(
                margin: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white.withOpacity(0.03), width: 1),
                ),
              ),
              Container(
                margin: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white.withOpacity(0.03), width: 1.5),
                ),
              ),
              Container(
                margin: const EdgeInsets.all(36),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white.withOpacity(0.03), width: 1),
                ),
              ),
              
              // Thumbnail Album Center
              // Thumbnail Album Center
              Container(
                width: widget.size * 0.45,
                height: widget.size * 0.45,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.grey[900],
                  border: Border.all(color: const Color(0xFF070709), width: widget.size * 0.033),
                  image: widget.thumbnailUrl.isNotEmpty
                      ? DecorationImage(
                          image: NetworkImage(widget.thumbnailUrl),
                          fit: BoxFit.cover,
                        )
                      : null,
                ),
                child: widget.thumbnailUrl.isEmpty
                    ? Icon(Icons.music_note_rounded, color: Colors.white24, size: widget.size * 0.16)
                    : null,
              ),
              
              // Center Vinyl Spindle Hole
              Container(
                width: widget.size * 0.07,
                height: widget.size * 0.07,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xFF0F0E13),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Search Modal Overlay Bottom Sheet
class SearchBottomSheet extends StatefulWidget {
  const SearchBottomSheet({super.key});

  @override
  State<SearchBottomSheet> createState() => _SearchBottomSheetState();
}

class _SearchBottomSheetState extends State<SearchBottomSheet> {
  final TextEditingController _searchController = TextEditingController();
  final ApiService _apiService = ApiService();
  List<Track> _searchResults = [];
  bool _isLoading = false;
  Timer? _debounce;

  void _performSearch() async {
    final query = _searchController.text.trim();
    if (query.isEmpty) {
      setState(() {
        _searchResults = [];
      });
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final results = await _apiService.searchTracks(query);
    if (!mounted) return;
    setState(() {
      _searchResults = results;
      _isLoading = false;
    });
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      _performSearch();
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<RoomProvider>(context, listen: false);

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return ClipRRect(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
            child: Container(
              color: const Color(0xFF121116).withOpacity(0.92),
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Column(
                children: [
                  // Pull pill
                  Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.white24,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 20),
                  
                  // Search Text Input
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          autofocus: true,
                          style: GoogleFonts.inter(color: Colors.white, fontSize: 15),
                          textInputAction: TextInputAction.search,
                          onChanged: _onSearchChanged,
                          onSubmitted: (_) => _performSearch(),
                          decoration: InputDecoration(
                            hintText: "Search songs on YouTube...",
                            hintStyle: GoogleFonts.inter(color: Colors.white30, fontSize: 14),
                            prefixIcon: const Icon(Icons.search_rounded, color: Colors.white54),
                            filled: true,
                            fillColor: Colors.white.withOpacity(0.04),
                            contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: BorderSide(color: Colors.white.withOpacity(0.05)),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: const BorderSide(color: Color(0xFF6366F1), width: 1.5),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: Text(
                          "Cancel",
                          style: GoogleFonts.inter(color: Colors.white70, fontSize: 14),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Results Area
                  Expanded(
                    child: _isLoading
                        ? const Center(
                            child: CircularProgressIndicator(
                              color: Color(0xFF6366F1),
                            ),
                          )
                        : _searchResults.isEmpty
                            ? Center(
                                child: Text(
                                  _searchController.text.isEmpty
                                      ? "Type to search..."
                                      : "No results found.",
                                  style: GoogleFonts.inter(color: Colors.white30),
                                ),
                              )
                            : ListView.builder(
                                controller: scrollController,
                                itemCount: _searchResults.length,
                                itemBuilder: (context, index) {
                                  final track = _searchResults[index];
                                  return ListTile(
                                    contentPadding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                                    leading: ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: Image.network(
                                        track.thumbnail,
                                        width: 50,
                                        height: 50,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, _, _) => Container(
                                          width: 50,
                                          height: 50,
                                          color: Colors.white10,
                                          child: const Icon(Icons.music_note_rounded, color: Colors.white30),
                                        ),
                                      ),
                                    ),
                                    title: Text(
                                      track.title,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.inter(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w600,
                                        fontSize: 14,
                                      ),
                                    ),
                                    subtitle: Text(
                                      "Tap to play collaboratively",
                                      style: GoogleFonts.inter(color: Colors.white30, fontSize: 12),
                                    ),
                                    onTap: () {
                                      provider.playTrack(track);
                                      Navigator.pop(context);
                                    },
                                  );
                                },
                              ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
