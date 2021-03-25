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
      
      const productInfo: Product = await api.get("/products").then((response) => response.data[productId]);

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
              throw "Estoque zerado";
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
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
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
