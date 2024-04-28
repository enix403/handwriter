import "./reset.css";
import "@mantine/core/styles.css";
import "./App.scss";

// Fonts
import "@fontsource/inter/100.css";
import "@fontsource/inter/200.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";

// WASM
import { loadWasmCore, wasmCore } from "./tunnel";
(window as any).wasmCore = wasmCore;

// Router
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Helmet
import { Helmet } from "react-helmet";

// Mantine
import { MantineProvider } from "@mantine/core";
import { theme } from "./theme";

// Pages
import { Home } from "./features/Home";
import { useEffect, useState } from "react";

export function App() {
  let [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Load the WASM Core
    loadWasmCore().then(() => {
      setLoading(false);
      wasmCore.initialize();
    });
  }, []);

  return (
    <>
      {loading ? (
        "Loading..."
      ) : (
        <>
          <Helmet>
            <title>Wiggly</title>
          </Helmet>
          <MantineProvider defaultColorScheme='dark' theme={theme}>
            <BrowserRouter>
              <Routes>
                <Route path='/' Component={Home} />
              </Routes>
            </BrowserRouter>
          </MantineProvider>
        </>
      )}
    </>
  );
}
