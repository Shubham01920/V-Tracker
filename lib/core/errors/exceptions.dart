class ServerException implements Exception {
  final String message;
  const ServerException([this.message = 'Server error']);

  @override
  String toString() => message;
}

class CacheException implements Exception {
  final String message;
  const CacheException([this.message = 'Cache error']);

  @override
  String toString() => message;
}

class NetworkException implements Exception {
  final String message;
  const NetworkException([this.message = 'Network error']);

  @override
  String toString() => message;
}
