import React, { useState } from "react";

const App = () => {
  const [data, setData] = useState(null); // Stochează datele extrase
  const [error, setError] = useState(""); // Stochează erorile
  const [activeSource, setActiveSource] = useState(""); // Păstrează sursa activă

  const handleScrape = async (source) => {
    setActiveSource(source); // Setează sursa activă
    setError("");
    setData(null);

    try {
      const response = await fetch("http://localhost:5000/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ source }), // Trimite sursa către backend
      });

      const result = await response.json();

      if (response.ok) {
        // Filtrează liniile goale consecutive
        const filteredData = result.data.filter((item, index, array) => {
          return !(index > 0 && !array[index - 1].href && !item.href);
        });
        setData(filteredData); // Stochează rezultatul
      } else {
        setError(result.error || "An error occurred");
      }
    } catch (err) {
      setError("Failed to fetch data");
    }
  };

  return (
    <div style={{ padding: "0px", margin:"0px", fontFamily: "Arial, sans-serif" }}>
      <h1>Turnul de Veghe</h1>
      <div style={{
         marginBottom: "20px",
         position: "sticky",
         top: "0",
         background: "white",
         boxShadow: "0 3px 3px lightgrey",
         padding: "20px" 
         }}
      >
        <button
          onClick={() => handleScrape("g4media")}
          style={{
            border: "1px solid black",
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: activeSource === "g4media" ? "black" : "white",
            color: activeSource === "g4media" ? "white" : "black",
          }}
        >
          G4Media.ro
        </button>

        <button
          onClick={() => handleScrape("ziare")}
          style={{
            border: "1px solid black",
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: activeSource === "ziare" ? "black" : "white",
            color: activeSource === "ziare" ? "white" : "black",
          }}
        >
          Ziare.com
        </button>

        <button
          onClick={() => handleScrape("hotnews")}
          style={{
            border: "1px solid black",
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: activeSource === "hotnews" ? "black" : "white",
            color: activeSource === "hotnews" ? "white" : "black",
          }}
        >
          HotNews.ro
        </button>

        <button
          onClick={() => handleScrape("adevarul")}
          style={{
            border: "1px solid black",
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: activeSource === "adevarul" ? "black" : "white",
            color: activeSource === "adevarul" ? "white" : "black",
          }}
        >
          Adevarul.ro
        </button>
   

        <button
          onClick={() => handleScrape("spotmedia")}
          style={{
            border: "1px solid black",
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: activeSource === "spotmedia" ? "black" : "white",
            color: activeSource === "spotmedia" ? "white" : "black",
          }}
        >
          SpotMedia.ro
        </button>

        <button
          onClick={() => handleScrape("libertatea")}
          style={{
            border: "1px solid black",
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: activeSource === "libertatea" ? "black" : "white",
            color: activeSource === "libertatea" ? "white" : "black",
          }}
        >
          Libertatea.ro
        </button>

        <button
          onClick={() => handleScrape("stirileprotv")}
          style={{
            border: "1px solid black",
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: activeSource === "stirileprotv" ? "black" : "white",
            color: activeSource === "stirileprotv" ? "white" : "black",
          }}
        >
          Stirileprotv.ro
        </button>  

        <button
          onClick={() => handleScrape("digi24")}
          style={{
            border: "1px solid black",
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: activeSource === "digi24" ? "black" : "white",
            color: activeSource === "digi24" ? "white" : "black",
          }}
        >
          Digi24.ro
        </button>  

        <button
          onClick={() => handleScrape("news")}
          style={{
            border: "1px solid black",
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: activeSource === "news" ? "black" : "white",
            color: activeSource === "news" ? "white" : "black",
          }}
        >
          News.ro
        </button>                        
      </div>

      {data && (
        <div style={{ marginTop: "20px", color: "green", padding:"20px" }}>
          {data.map((item, index) => (
            <div key={index}>
              {item.href && (
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  <h3>{item.text}</h3>
                </a>
              )}
              {!item.href ? null : <hr />}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default App;
