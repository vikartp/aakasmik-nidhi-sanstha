import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

export function Default() {
  const navigate = useNavigate();
  return (
    <>
      <div className="flex flex-col items-center justify-center -mt-2">
        <div className="flex items-center space-x-4">
          <Button onClick={() => navigate("/register")}>Register</Button>
          <Button onClick={() => navigate("/login")}>Login</Button>
        </div>
        <h2 className="text-2xl font-semibold mt-1">
          Welcome to Contingency Fund Youth Association, Barkangango
        </h2>
        <p className="mt-2">
          At the heart of Barkangango village lies a strong spirit of unity,
          compassion, and mutual support — values that form the foundation of
          the Contingency Fund Youth Association, Barkangango. We are a
          community-driven group made up of hundreds of dedicated individuals
          who believe in standing by each other during times of crisis. Every
          month, each member contributes a small amount to a shared fund. This
          collective effort builds a financial safety net that can be used to
          support any member facing an unexpected emergency — be it a medical
          issue, natural disaster, or any urgent personal crisis. Our mission is
          simple yet powerful: "Together, we are stronger." Through regular
          contributions and transparent management, we ensure that help is
          always available when someone in our community needs it the most. By
          coming together, we not only share financial responsibility but also
          foster a deep sense of belonging, solidarity, and hope among the youth
          of our village.
        </p>
      </div>
    </>
  );
}
