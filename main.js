import { GeneralParameters } from "./components/GeneralParameters.js";
import { ComponentItem } from "./components/ComponentItem.js";
import { ComponentList } from "./components/ComponentList.js";
import { ProductItem } from "./components/ProductItem.js";
import { ProductList } from "./components/ProductList.js";
import { ProductionPlanner } from "./components/ProductionPlanner.js";
import { SolutionAnalysis } from "./components/SolutionAnalysis.js";
import { ModalComponent } from "./components/ModalComponent.js";

customElements.define("general-parameters", GeneralParameters);
customElements.define("component-item", ComponentItem);
customElements.define("component-list", ComponentList);
customElements.define("product-item", ProductItem);
customElements.define("product-list", ProductList);
customElements.define("modal-component", ModalComponent);
customElements.define("solution-analysis", SolutionAnalysis);
customElements.define("production-planner", ProductionPlanner);
