import React, { useContext } from "react";
import { userDataContext } from "../Context/UserContext.jsx";

const Card = ({ image }) => {
  const { setSelectedImage } = useContext(userDataContext);

  return (
    <button
      onClick={() => setSelectedImage(image)}
      className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white text-left shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_28px_80px_rgba(14,165,233,0.16)]"
    >
      <div className="relative h-[360px] w-full overflow-hidden">
        <img
          src={image}
          alt="Assistant preview"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-sm font-medium text-slate-900">Assistant style</p>
          <p className="text-xs text-slate-500">Click to select this look</p>
        </div>
        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white">
          Select
        </span>
      </div>
    </button>
  );
};

export default Card;
