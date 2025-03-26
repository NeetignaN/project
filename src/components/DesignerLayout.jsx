import { NavLink, Outlet } from "react-router-dom";

function DesignerLayout() {
  return (
    <div>
      <h1>sidebar</h1>
      <NavLink to="designer/clients">CLIENTS</NavLink>
      <Outlet />
    </div>
  );
}

export default DesignerLayout;
