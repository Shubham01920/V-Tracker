enum RewardStatus { unscratched, scratched }

enum RewardType { cashback, voucher }

class RewardModel {
  final String id;
  final String title;
  final String subtitle;
  final double amount;
  final RewardStatus status;
  final RewardType type;
  final String description;
  final String code;
  final DateTime date;

  RewardModel({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.amount,
    required this.status,
    required this.type,
    required this.description,
    required this.code,
    required this.date,
  });

  RewardModel copyWith({
    String? id,
    String? title,
    String? subtitle,
    double? amount,
    RewardStatus? status,
    RewardType? type,
    String? description,
    String? code,
    DateTime? date,
  }) {
    return RewardModel(
      id: id ?? this.id,
      title: title ?? this.title,
      subtitle: subtitle ?? this.subtitle,
      amount: amount ?? this.amount,
      status: status ?? this.status,
      type: type ?? this.type,
      description: description ?? this.description,
      code: code ?? this.code,
      date: date ?? this.date,
    );
  }
}
