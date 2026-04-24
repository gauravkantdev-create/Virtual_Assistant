import React, { useContext, useRef } from "react";
import { IoImagesSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Card from "../Components/Card.jsx";
import { userDataContext } from "../Context/UserContext.jsx";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/image4.png";
import image4 from "../assets/image5.png";
import image5 from "../assets/image6.jpeg";
import image6 from "../assets/image7.jpeg";
import image7 from "../assets/authBg.png";

const Customization = () => {
  const images = [image1, image2, image3, image4, image5, image6, image7];
  const inputImage = useRef(null);
  const navigate = useNavigate();

  const userCtx = useContext(userDataContext);
  if (!userCtx) return null;

  const {
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage,
  } = userCtx;

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageURL = URL.createObjectURL(file);
    setFrontendImage(imageURL);
    setSelectedImage(imageURL);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-sky-600">
              Step 1 of 2
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Choose the assistant look
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Pick a style that fits your assistant, or upload your own image for a
              more personal setup.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/signin")}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Back
            </button>
            {selectedImage && (
              <button
                onClick={() => navigate("/customize2")}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Continue
              </button>
            )}
          </div>
        </div>

        {selectedImage ? (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_70px_rgba(15,23,42,0.08)]">
              <p className="text-sm font-medium text-slate-500">Selected preview</p>
              <img
                src={selectedImage}
                alt="Selected assistant"
                className="mt-4 h-[420px] w-full rounded-[1.5rem] object-cover"
              />
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_70px_rgba(15,23,42,0.08)]">
              <p className="text-sm font-medium text-slate-500">Next step</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                Great choice. Let&apos;s give your assistant a name.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                You can keep this image, choose a different one, or upload a custom
                picture before moving forward.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Choose again
                </button>
                <button
                  onClick={() => inputImage.current?.click()}
                  className="rounded-full border border-sky-200 bg-sky-50 px-5 py-3 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
                >
                  Upload custom image
                </button>
                <button
                  onClick={() => navigate("/customize2")}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Continue to naming
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {images.map((img, index) => (
                <Card key={index} image={img} />
              ))}

              <button
                onClick={() => inputImage.current?.click()}
                className="flex min-h-[360px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white p-6 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition hover:border-sky-400 hover:bg-sky-50"
              >
                {frontendImage ? (
                  <img
                    src={frontendImage}
                    alt="Uploaded assistant"
                    className="h-full w-full rounded-[1.5rem] object-cover"
                  />
                ) : (
                  <>
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                      <IoImagesSharp className="text-3xl" />
                    </div>
                    <h2 className="mt-5 text-lg font-semibold text-slate-900">
                      Upload your own image
                    </h2>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                      Use a custom avatar if you want the assistant to feel more
                      personal.
                    </p>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          ref={inputImage}
          hidden
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default Customization;
