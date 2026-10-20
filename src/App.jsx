import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

import Preloader from "./components/Preloader.jsx";
import Cursor from "./components/Cursor.jsx";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import Marquee from "./components/Marquee.jsx";
import About from "./components/About.jsx";
import Menu from "./components/Menu.jsx";
import Gallery from "./components/Gallery.jsx";
import Reviews from "./components/Reviews.jsx";
import Footer from "./components/Footer.jsx";
import BookingModal from "./components/Booking.jsx";
import { BookingProvider, useBooking } from "./lib/booking.jsx";

gsap.registerPlugin(ScrollTrigger, SplitText);

function Site() {
  const [ready, setReady] = useState(false);
  const { open } = useBooking();
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (!lenisRef.current) return;
    if (open) lenisRef.current.stop();
    else lenisRef.current.start();
  }, [open]);

  return (
    <>
      <Cursor />
      <Preloader onComplete={() => setReady(true)} />
      <Nav ready={ready} />
      <main>
        <Hero ready={ready} />
        <Marquee />
        <About />
        <Menu />
        <Gallery />
        <Reviews />
      </main>
      <Footer />
      <BookingModal />
    </>
  );
}

export default function App() {
  return (
    <BookingProvider>
      <Site />
    </BookingProvider>
  );
}
