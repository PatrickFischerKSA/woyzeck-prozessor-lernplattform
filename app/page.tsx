export default function Home() {
  return (
    <main className="site-frame">
      <iframe
        src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/woyzeck/index.html`}
        title="Woyzeck – offene Montagewerkstatt"
        allow="microphone"
      />
    </main>
  );
}
