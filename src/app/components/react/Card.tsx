import { useState } from "react";

type CardProps = {
  heading: string;
  description: string;
};

function Card({ heading, description }: CardProps) {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className={`card ${isActive ? "card--active" : ""}`}>
      <h3 className="card__title">{heading}</h3>
      {isActive && <p className="card__description">{description}</p>}
      <button
        className="card__toggle"
        onClick={() => setIsActive((prev) => !prev)}
      >
        {isActive ? "Hide details" : "Show details"}
      </button>
    </div>
  );
}

export default function Demo() {
  return (
    <Card
      heading="Live React Compiler"
      description="This is a live React compiler that allows you to write and compile React components directly in the browser. You can write your component code in TypeScript, and it will be compiled and rendered in real-time."
    />
  );
}
