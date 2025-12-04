import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../contexts/AppContext";

function Result() {
  const [image, setImage] = useState("sampleimg.png");
  const [isImageLoad, setImageLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [input, setInput] = useState("");
  const { generateImage } = useContext(AppContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProgress(0);


    let interval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 2 : prev)); // goes till 90%
    }, 100);

    if (input) {
      const generatedImage = await generateImage(input);
      if (generatedImage) {
        setImage(generatedImage);
        setImageLoad(true);
      }
    }

    clearInterval(interval);
    setProgress(100);
    setInput("");
    setTimeout(() => setLoading(false), 500); // small delay for smoothness
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col min-h-[90vh] items-center justify-center"
    >
      <div className="relative">
        <img
          src={image}
          alt="Generated"
          className="max-w-sm w-full h-auto object-cover rounded-lg shadow-lg"
        />

        {loading && (
          <div className="absolute bottom-0 left-0 w-full">
            {/* Gradient progress bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
                           transition-all duration-200 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center mt-2 via-purple-500 font-medium">
              Generating your image... {progress}%
            </p>
          </div>
        )}
      </div>

      {!isImageLoad && !loading && (
        <div className="flex w-full max-w-xl bg-black/20 text-white text-sm p-0.5 mt-10 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            className="flex-1 bg-transparent outline-none ml-8 max-sm:w-20"
            type="text"
            placeholder="Describe your thought..."
          />
          <button
            type="submit"
            className="bg-black/20 px-10 sm:px-16 py-3 rounded-full"
          >
            Generate
          </button>
        </div>
      )}

      {isImageLoad && !loading && (
        <div className="flex flex-wrap gap-2 justify-center text-white text-sm p-0.5 mt-10 rounded-full">
          <p
            onClick={() => setImageLoad(false)}
            className="bg-transparent border-2 border-white/70 text-white/70 px-8 py-3 rounded-full cursor-pointer"
          >
            Generate Another
          </p>
          <a
            href={image}
            download
            className="bg-white/70 px-10 sm:px-16 py-3 rounded-full text-black border-white"
          >
            Download
          </a>
        </div>
      )}
    </form>
  );
}

export default Result;
