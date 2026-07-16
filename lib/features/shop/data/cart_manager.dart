import 'package:flutter/foundation.dart';
import 'package:snap_q/features/shop/presentation/screens/shop_screen.dart';

class CartItem {
  final Product product;
  int quantity;

  CartItem({required this.product, this.quantity = 1});
}

class CartManager extends ChangeNotifier {
  CartManager._internal();
  static final CartManager _instance = CartManager._internal();
  factory CartManager() => _instance;

  final List<CartItem> _items = [];

  List<CartItem> get items => List.unmodifiable(_items);

  int get totalItems => _items.fold(0, (sum, item) => sum + item.quantity);

  double get totalPrice {
    return _items.fold(0.0, (sum, item) {
      final cleanPrice = item.product.price.replaceAll(RegExp(r'[^\d.]'), '');
      final priceVal = double.tryParse(cleanPrice) ?? 0.0;
      return sum + (priceVal * item.quantity);
    });
  }

  void addProduct(Product product) {
    final index = _items.indexWhere((item) => item.product.title == product.title);
    if (index >= 0) {
      _items[index].quantity++;
    } else {
      _items.add(CartItem(product: product));
    }
    notifyListeners();
  }

  void removeProduct(Product product) {
    final index = _items.indexWhere((item) => item.product.title == product.title);
    if (index >= 0) {
      if (_items[index].quantity > 1) {
        _items[index].quantity--;
      } else {
        _items.removeAt(index);
      }
      notifyListeners();
    }
  }

  void deleteProduct(Product product) {
    _items.removeWhere((item) => item.product.title == product.title);
    notifyListeners();
  }

  void clearCart() {
    _items.clear();
    notifyListeners();
  }
}
