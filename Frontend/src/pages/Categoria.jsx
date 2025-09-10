import { useParams } from "react-router-dom";
import productsData from "../data/products";
import ProductList from "../components/ProductList";
import "../Css/ProductList.css"


const Categoria = () => {
  const { categoria, subcategoria } = useParams();

  let productos = [];

  if (subcategoria) {
    productos =
      productsData[categoria] && productsData[categoria][subcategoria]
        ? productsData[categoria][subcategoria]
        : [];
  } else {
    productos =
      productsData[categoria] && typeof productsData[categoria] === "object"
        ? Object.values(productsData[categoria]).flat()
        : [];
  }

  return (
    <div className="categoria">
      <h1 className="title-categori">
        {categoria} {subcategoria && `- ${subcategoria}`}
      </h1>
      <ProductList products={productos} />
    </div>
  );
};

export default Categoria;
