import React, { useEffect, useState } from "react";
import axios from "axios";

const päevad = ["Esmaspäev", "Teisipäev", "Kolmapäev", "Neljapäev", "Reede"];
const tunnid = [1, 2, 3, 4, 5, 6, 7, 8];

function App() {
  const [broneeringud, setBroneeringud] = useState([]);
  const [muudetav, setMuudetav] = useState(null);
  const [klass, setKlass] = useState("");
  const [modalAvatud, setModalAvatud] = useState(false);
  const [valitudPäev, setValitudPäev] = useState("");
  const [valitudTund, setValitudTund] = useState(null);
  const [tunniNimi, setTunniNimi] = useState("");
  const [opetaja, setOpetaja] = useState("");

  useEffect(() => {
    laeBroneeringud();
  }, []);

  const laeBroneeringud = () => {
    axios
      .get("http://localhost:5000/broneeringud")
      .then((response) => setBroneeringud(response.data))
      .catch((error) =>
        console.error("Viga broneeringute laadimisel:", error)
      );
  };

  const alustaLisamist = (päev, tund) => {
    setValitudPäev(päev);
    setValitudTund(tund);
    setKlass("");
    setTunniNimi("");
    setOpetaja("");
    setMuudetav(null);
    setModalAvatud(true);
  };

  const alustaMuutmist = (broneering) => {
    setMuudetav(broneering.id);
    setValitudPäev(broneering.paev);
    setValitudTund(broneering.tund);
    setKlass(broneering.klass);
    setTunniNimi(broneering.tunni_nimi || "");
    setOpetaja(broneering.opetaja || "");
    setModalAvatud(true);
  };

  const salvestaBroneering = () => {
    const apiUrl = muudetav
      ? `http://localhost:5000/broneeringud/${muudetav}`
      : "http://localhost:5000/broneeringud";
    const apiMethod = muudetav ? axios.put : axios.post;
  
    apiMethod(apiUrl, { paev: valitudPäev, tund: valitudTund, klass, tunni_nimi: tunniNimi, opetaja })
      .then(() => {
        setModalAvatud(false);
        laeBroneeringud();
      })
      .catch((error) =>
        console.error("Viga broneeringu salvestamisel:", error)
      );
  };
  
  const kustutaBroneering = (id) => {
    if (window.confirm("Kas oled kindel, et soovid kustutada?")) {
      axios
        .delete(`http://localhost:5000/broneeringud/${id}`)
        .then(() => laeBroneeringud())
        .catch((error) =>
          console.error("Viga broneeringu kustutamisel:", error)
        );
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "90%", margin: "auto" }}>
      <h1>Arvutiklassi kasutamine</h1>

      {/* Tabel */}
      <table
        border="1"
        cellPadding="10"
        cellSpacing="0"
        style={{ width: "100%", textAlign: "center", tableLayout: "fixed" }}
      >
        <thead>
          <tr>
            <th style={{ width: "10%" }}>Tund</th>
            {päevad.map((päev) => (
              <th key={päev} style={{ width: "18%" }}>{päev}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tunnid.map((tund) => (
            <tr key={tund}>
              <td><strong>{tund}. tund</strong></td>
              {päevad.map((päev) => {
                const broneering = broneeringud.find(
                  (b) => b.paev === päev && b.tund === tund
                );

                return (
                  <td key={`${päev}-${tund}`} style={{
                    textAlign: "center",
                    padding: "15px",
                    minHeight: "80px",
                    wordWrap: "break-word"
                  }}>
                    {broneering ? (
                      <>
                        <div><strong>{broneering.klass}</strong>, {broneering.tunni_nimi}, {broneering.opetaja} </div>
                        <div style={{ marginTop: "10px" }}>
                          <button onClick={() => alustaMuutmist(broneering)}
                            style={{
                              backgroundColor: "#007BFF",
                              color: "white",
                              border: "none",
                              padding: "5px 10px",
                              cursor: "pointer",
                              borderRadius: "5px",
                              marginRight: "5px"
                            }}>
                            Muuda
                          </button>
                          <button onClick={() => kustutaBroneering(broneering.id)}
                            style={{
                              backgroundColor: "#DC3545",
                              color: "white",
                              border: "none",
                              padding: "5px 10px",
                              cursor: "pointer",
                              borderRadius: "5px"
                            }}>
                            🗑 Kustuta
                          </button>
                        </div>
                      </>
                    ) : (
                      <button onClick={() => alustaLisamist(päev, tund)}
                        style={{
                          backgroundColor: "#28A745",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          cursor: "pointer",
                          borderRadius: "5px"
                        }}>
                        ➕ Lisa
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modaalaken broneeringu lisamiseks/muutmiseks */}
      {modalAvatud && (
        <div
          style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: "20px",
            border: "2px solid black",
            zIndex: 1000,
            boxShadow: "0px 4px 8px rgba(0,0,0,0.2)"
          }}
        >
          <h2>{muudetav ? "Muuda broneeringut" : "Lisa uus broneering"}</h2>
          <input type="text" placeholder="Klass" value={klass} onChange={(e) => setKlass(e.target.value)} />
          <input type="text" placeholder="Tunni nimi" value={tunniNimi} onChange={(e) => setTunniNimi(e.target.value)} />
          <input type="text" placeholder="Õpetaja" value={opetaja} onChange={(e) => setOpetaja(e.target.value)} />
          <button onClick={salvestaBroneering} style={{ backgroundColor: "#007BFF", color: "white", border: "none", padding: "10px 15px", cursor: "pointer", borderRadius: "5px" }}>
            {muudetav ? "Salvesta muudatused" : "Lisa broneering"}
          </button>
          <button onClick={() => setModalAvatud(false)} style={{ backgroundColor: "#6C757D", color: "white", border: "none", padding: "10px 15px", cursor: "pointer", borderRadius: "5px", marginLeft: "10px" }}>
            Sulge
          </button>
        </div>
      )}
    </div>
  );
}

export default App;