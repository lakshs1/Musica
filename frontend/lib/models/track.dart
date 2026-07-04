class Track {
  final String youtubeId;
  final String title;
  final String thumbnail;
  final String duration;

  Track({
    required this.youtubeId,
    required this.title,
    required this.thumbnail,
    required this.duration,
  });

  factory Track.fromJson(Map<String, dynamic> json) {
    return Track(
      youtubeId: json['youtube_id'] ?? '',
      title: json['title'] ?? 'Unknown Title',
      thumbnail: json['thumbnail'] ?? '',
      duration: json['duration'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'youtube_id': youtubeId,
      'title': title,
      'thumbnail': thumbnail,
      'duration': duration,
    };
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Track &&
          runtimeType == other.runtimeType &&
          youtubeId == other.youtubeId;

  @override
  int get hashCode => youtubeId.hashCode;
}
