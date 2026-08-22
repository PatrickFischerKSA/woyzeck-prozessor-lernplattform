export default function Home() {
  return (
    <main className="site-frame">
      <iframe
        src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/woyzeck/index.html`}
        title="Woyzeck-Prozessor – interaktive Lektüre- und Interpretationsumgebung"
        allow="microphone"
      />
    </main>
  );
}
