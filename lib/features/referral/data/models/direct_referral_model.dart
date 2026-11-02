class DirectReferralModel {
  final int sn;
  final String name;
  final String email;
  final String userId;
  final String joinedDate;
  final int totalTeam;
  final int activeTeam;
  final String status;

  const DirectReferralModel({
    required this.sn,
    required this.name,
    required this.email,
    required this.userId,
    required this.joinedDate,
    required this.totalTeam,
    required this.activeTeam,
    required this.status,
  });

  factory DirectReferralModel.fromJson(Map<String, dynamic> json) {
    return DirectReferralModel(
      sn: json['sn'] as int? ?? 0,
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      joinedDate: json['joinedDate'] as String? ?? '',
      totalTeam: json['totalTeam'] as int? ?? 0,
      activeTeam: json['activeTeam'] as int? ?? 0,
      status: json['status'] as String? ?? 'ACTIVE',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'sn': sn,
      'name': name,
      'email': email,
      'userId': userId,
      'joinedDate': joinedDate,
      'totalTeam': totalTeam,
      'activeTeam': activeTeam,
      'status': status,
    };
  }
}
