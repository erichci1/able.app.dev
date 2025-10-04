export default async function ExploreMenuServer() {
  return (
    <nav className="card" style={{ display: "flex", gap: 8, padding: 12 }}>
      <a className="btn btn-ghost" href="/challenges">Challenges</a>
      <a className="btn btn-ghost" href="/audio">Audio</a>
      <a className="btn btn-ghost" href="/videos">Videos</a>
      <a className="btn btn-ghost" href="/resources">Resources</a>
    </nav>
  );
}