import ThemeCanvas from "../components/storefront/ThemeCanvas";
import { useCart } from "../context/CartContext";
import { useStorefrontThemes } from "../context/StorefrontThemeContext";

export default function Storefront() {
  const { addItem } = useCart();
  const { activeTheme } = useStorefrontThemes();

  return <ThemeCanvas theme={activeTheme} addItem={addItem} />;
}
