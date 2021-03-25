import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productStock = await api
        .get("stock")
        .then((response) => response.data[productId].amount);

      const productInfo: Product = await api
        .get("/products")
        .then((response) => response.data[productId]);

      if (!productInfo || !productStock) {
        throw "Erro na adição do produto";
      }

      const newCart: Product = {
        id: productId,
        amount: 1,
        title: productInfo.title,
        image: productInfo.image,
        price: productInfo.price,
      };

      let storagedCart = localStorage.getItem("@RocketShoes:cart");
      let cartProducts: Product[] = storagedCart
        ? JSON.parse(storagedCart)
        : [];

      if (cartProducts.length > 0) {
        var o = cartProducts.find((o, i) => {
          if (o.id == productId) {
            o.amount += 1;
            if (o.amount > productStock) {
              throw "Quantidade solicitada fora de estoque";
            } else {
              cartProducts[i] = {
                id: productId,
                amount: o.amount,
                title: productInfo.title,
                image: productInfo.image,
                price: productInfo.price,
              };
              return true;
            }
          }
        });
        if (o) {
          localStorage.setItem(
            "@RocketShoes:cart",
            JSON.stringify(cartProducts)
          );
          setCart(cartProducts);
        } else {
          cartProducts.push(newCart);
          localStorage.setItem(
            "@RocketShoes:cart",
            JSON.stringify(cartProducts)
          );
          setCart(cartProducts);
        }
      } else {
        cartProducts.push(newCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(cartProducts));
        setCart(cartProducts);
      }
    } catch (e) {
      toast.error(e);
    }
  };

  const removeProduct = (productId: number) => {
    try {
      let storagedCart = localStorage.getItem("@RocketShoes:cart");
      let cartProducts: Product[] = storagedCart
        ? JSON.parse(storagedCart)
        : [];
      cartProducts = cart.filter((product) => {
        return productId !== product.id;
      })

      setCart(cartProducts);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(cartProducts));

    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const productStock = await api
        .get("stock")
        .then((response) => response.data[productId].amount);

      if (amount > productStock) {
        throw "Quantidade solicitada fora de estoque";
      }

      if (amount < 0) {
        throw "Erro na alteração de quantidade do produto";
      }

      const carts: Product[] = cart.map((product) => {
        if (product.id === productId) {
          product.amount = amount;
        }
        return product;
      });

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(carts));
      setCart(carts);
    } catch (e) {
      throw toast.error(e);
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
