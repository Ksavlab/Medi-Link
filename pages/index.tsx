import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase-browser.ts";

type Page = "home" | "find" | "hospitals" | "queue" | "meds" | "blood" | "lab" | "maternal" | "register";

type Facility = {
  id: number;
  name: string;
  type: string;
  location: string;
  distance: string;
  open: string;
  close: string;
  services: string[];
  phone: string;
};

const facilities: Facility[] = [
  { id: 1, name: "Nairobi Hospital", type: "Hospital", location: "Argwings Kodhek Rd", distance: "2.4 km", open: "00:00", close: "23:59", services: ["Emergency", "Laboratory", "Maternity", "Pharmacy"], phone: "+254 703 082000" },
  { id: 2, name: "Kenyatta National Hospital", type: "Teaching & Referral Hospital", location: "Hospital Rd, Nairobi", distance: "4.1 km", open: "00:00", close: "23:59", services: ["Emergency", "Surgery", "Maternity", "Laboratory"], phone: "+254 20 2726300" },
  { id: 3, name: "Afya Community Clinic", type: "Clinic", location: "Kilimani", distance: "1.1 km", open: "08:00", close: "20:00", services: ["General Care", "Laboratory", "Pharmacy"], phone: "+254 700 000000" }
];

const symptoms = ["Fever", "Cough", "Headache", "Stomach pain", "Injury", "Pregnancy care", "Other"];

function Header({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const links: [Page, string][] = [["home", "Home"], ["find", "Find Care"], ["hospitals", "Hospitals"], ["queue", "Queues"], ["meds", "Medications"]];
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <button onClick={() => setPage("home")} className="flex items-center gap-2 font-black text-xl text-emerald-700">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white">+</span> MediLink
        </button>
        <nav className="hidden gap-1 md:flex">
          {links.map(([id, label]) => <button key={id} onClick={() => setPage(id)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${page === id ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-100"}`}>{label}</button>)}
        </nav>
        <div className="flex items-center gap-2">
  {authLoading ? (
    <span className="text-sm text-slate-400">Loading...</span>
  ) : userEmail ? (
    <>
      <span className="hidden text-sm font-semibold text-slate-600 md:block">
        {userEmail}
      </span>

      <button
        onClick={handleLogout}
        className="btn-secondary text-sm"
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <a href="/auth" className="btn-secondary text-sm">
        Login
      </a>

      <button
        onClick={() => setPage("register")}
        className="btn-primary text-sm"
      >
        Register facility
      </button>
    </>
  )}
      </div>
    </header>
  );
}

function SectionTitle({ title, text }: { title: string; text?: string }) {
  return <div className="mb-6"><h2 className="text-2xl font-black text-slate-900">{title}</h2>{text && <p className="mt-1 text-slate-500">{text}</p>}</div>;
}

function FacilityCard({ f, setPage }: { f: Facility; setPage: (p: Page) => void }) {
  return <div className="card p-5">
    <div className="flex items-start justify-between gap-3">
      <div><h3 className="text-lg font-bold">{f.name}</h3><p className="text-sm text-slate-500">{f.type} · {f.location}</p></div>
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{f.distance}</span>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">{f.services.map(s => <span key={s} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{s}</span>)}</div>
    <div className="mt-4 flex items-center justify-between text-sm"><span className="text-slate-500">Open {f.open}–{f.close}</span><a href={`tel:${f.phone}`} className="font-bold text-emerald-700">Call</a></div>
    <button onClick={() => setPage("queue")} className="btn-secondary mt-4 w-full">View / join queue</button>
  </div>;
}

export default function Home() {
  const [page, setPage] = useState<Page>("home");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
    useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      setUserEmail(data.user?.email ?? null);
      setAuthLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserEmail(null);
    notify("You have been logged out.");
  }
  const [language, setLanguage] = useState<"EN" | "SW">("EN");
  const [lowData, setLowData] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState("Fever");
  const [urgency, setUrgency] = useState("Soon");
  const [search, setSearch] = useState("");
  const [joinedQueue, setJoinedQueue] = useState<number | null>(null);
  const [meds, setMeds] = useState(["Amoxicillin — 500 mg", "Paracetamol — 500 mg"]);
  const [bloodRequests, setBloodRequests] = useState([{ hospital: "Kenyatta National Hospital", group: "O+", units: 2 }]);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return facilities;
    return facilities.filter(f => `${f.name} ${f.location} ${f.services.join(" ")}`.toLowerCase().includes(q));
  }, [search]);

  const notify = (text: string) => { setMessage(text); setTimeout(() => setMessage(""), 3000); };

  const submitRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    notify("Facility registration submitted. In a production version, this will be saved for verification.");
    setPage("hospitals");
  };

  return <div className={lowData ? "min-h-screen bg-white" : "min-h-screen bg-slate-50"}>
    <Header page={page} setPage={setPage} />
    {message && <div className="fixed right-4 top-20 z-50 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg">{message}</div>}

    <main className="mx-auto max-w-7xl px-4 py-8">
      {page === "home" && <>
        <section className="overflow-hidden rounded-3xl bg-emerald-700 px-6 py-12 text-white md:px-12">
          <div className="max-w-3xl">
            <p className="mb-3 font-bold text-emerald-100">Healthcare access, simplified</p>
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">Find the right care when you need it.</h1>
            <p className="mt-5 max-w-2xl text-lg text-emerald-50">MediLink helps people discover healthcare facilities, understand care options, manage basic health tasks and reach emergency support.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => setPage("find")} className="btn bg-white text-emerald-700 hover:bg-emerald-50">Find care</button>
              <button onClick={() => setPage("hospitals")} className="btn bg-emerald-800 text-white hover:bg-emerald-900">Browse facilities</button>
              <button onClick={() => setPage("home")} onDoubleClick={() => notify("Emergency: call your local emergency service now.")} className="btn bg-red-500 text-white hover:bg-red-600">SOS</button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          {[["🏥","Find care","Match your needs with available facilities."],["🕐","Queues","See and join facility queues."],["🩸","BloodConnect","View and create blood requests."],["💊","Medications","Keep a simple medication list."]].map(([icon,title,desc]) =>
            <div key={title} className="card p-5"><div className="text-3xl">{icon}</div><h3 className="mt-3 font-bold">{title}</h3><p className="mt-1 text-sm text-slate-500">{desc}</p></div>
          )}
        </section>

        <section className="mt-10">
          <SectionTitle title="Facilities near you" text="Demo facilities are shown now; connect Supabase later for live facility data." />
          <div className="grid gap-4 md:grid-cols-3">{facilities.map(f => <FacilityCard key={f.id} f={f} setPage={setPage} />)}</div>
        </section>
      </>}

      {page === "find" && <><SectionTitle title="Find care" text="Tell us what you need. This is informational and does not replace a clinician." />
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="card p-5">
            <label className="text-sm font-bold">What are you experiencing?</label>
            <select className="input mt-2" value={selectedSymptom} onChange={e => setSelectedSymptom(e.target.value)}>{symptoms.map(s => <option key={s}>{s}</option>)}</select>
            <label className="mt-5 block text-sm font-bold">Urgency</label>
            <div className="mt-2 grid grid-cols-3 gap-2">{["Routine","Soon","Urgent"].map(u => <button key={u} onClick={() => setUrgency(u)} className={`rounded-xl border px-2 py-3 text-sm font-bold ${urgency === u ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200"}`}>{u}</button>)}</div>
            <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><b>Emergency warning:</b> severe breathing difficulty, unconsciousness, major bleeding or other life-threatening symptoms require emergency help immediately.</div>
          </div>
          <div><p className="mb-4 font-semibold text-slate-600">Suggested facilities for <span className="text-emerald-700">{selectedSymptom}</span> · {urgency}</p><div className="grid gap-4 md:grid-cols-2">{filtered.map(f => <FacilityCard key={f.id} f={f} setPage={setPage} />)}</div></div>
        </div>
      </>}

      {page === "hospitals" && <><SectionTitle title="Healthcare facilities" text="Search facilities, services and opening hours." />
        <input className="input mb-5" placeholder="Search hospital, clinic, service or area..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="grid gap-4 md:grid-cols-3">{filtered.map(f => <FacilityCard key={f.id} f={f} setPage={setPage} />)}</div>
      </>}

      {page === "queue" && <><SectionTitle title="Queue management" text="A simple patient-side queue prototype." />
        <div className="grid gap-4 md:grid-cols-3">{facilities.map(f => <div key={f.id} className="card p-5"><h3 className="font-bold">{f.name}</h3><p className="mt-1 text-sm text-slate-500">Estimated waiting: {f.id === 3 ? "15 min" : f.id === 1 ? "35 min" : "50 min"}</p><p className="mt-4 text-3xl font-black text-emerald-700">{f.id * 7 + 4}</p><p className="text-xs text-slate-500">people in queue</p><button onClick={() => { setJoinedQueue(f.id); notify(`Joined the queue at ${f.name}.`); }} className="btn-primary mt-5 w-full">{joinedQueue === f.id ? "You're in the queue" : "Join queue"}</button></div>)}</div>
      </>}

      {page === "meds" && <><SectionTitle title="My medications" text="Keep a simple personal list. Do not use this as a substitute for professional prescribing advice." />
        <div className="card max-w-2xl p-5">{meds.map((m,i) => <div key={m} className="flex items-center justify-between border-b border-slate-100 py-4"><span className="font-semibold">{m}</span><button onClick={() => setMeds(meds.filter((_,j)=>j!==i))} className="text-sm font-bold text-red-600">Remove</button></div>)}<button onClick={() => setMeds([...meds, "New medication — dosage not set"])} className="btn-primary mt-5">+ Add medication</button></div>
      </>}

      {page === "blood" && <><SectionTitle title="BloodConnect" text="Connect blood requests with potential donors. Verification and clinical coordination are required in production." />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card p-5"><h3 className="font-bold">Active requests</h3>{bloodRequests.map((r,i)=><div key={i} className="mt-4 rounded-xl bg-red-50 p-4"><b>{r.group}</b> · {r.units} units needed<p className="text-sm text-slate-600">{r.hospital}</p></div>)}</div>
          <div className="card p-5"><h3 className="font-bold">Create request</h3><select className="input mt-4"><option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option></select><button onClick={()=>{setBloodRequests([...bloodRequests,{hospital:"New facility",group:"O+",units:1}]);notify("Blood request added.");}} className="btn-primary mt-4 w-full">Post request</button></div>
        </div>
      </>}

      {page === "lab" && <><SectionTitle title="Lab result glossary" text="Plain-language explanations for common terms. Always discuss your actual results with a qualified clinician." />
        <div className="grid gap-4 md:grid-cols-2">{[["Haemoglobin","A protein in red blood cells that carries oxygen."],["White blood cells","Cells that help the body respond to infections and other immune signals."],["Glucose","A sugar measured in blood; interpretation depends on the test and context."],["Platelets","Blood components involved in clotting."]].map(([a,b])=><div key={a} className="card p-5"><h3 className="font-bold">{a}</h3><p className="mt-2 text-slate-600">{b}</p></div>)}</div>
      </>}

      {page === "maternal" && <><SectionTitle title="MaternalCare" text="General pregnancy information and care reminders." /><div className="grid gap-4 md:grid-cols-3">{["Attend recommended antenatal visits.","Take medicines only as advised by a qualified clinician.","Seek urgent care for heavy bleeding, severe pain, seizures, difficulty breathing or loss of consciousness."].map((x,i)=><div key={i} className="card p-5"><div className="text-2xl">🤰</div><p className="mt-3 font-semibold">{x}</p></div>)}</div></>}

      {page === "register" && <><SectionTitle title="Register a healthcare facility" text="Submit facility details for onboarding and verification." /><form onSubmit={submitRegister} className="card max-w-2xl space-y-4 p-6"><input className="input" required placeholder="Facility name" /><input className="input" required placeholder="Location / address" /><input className="input" required placeholder="Phone number" /><input className="input" required placeholder="Services (e.g. Emergency, Lab, Maternity)" /><div className="grid gap-4 sm:grid-cols-2"><input className="input" type="time" /><input className="input" type="time" /></div><button className="btn-primary w-full">Submit facility</button></form></>}

      <section className="mt-12 border-t border-slate-200 pt-6">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <button onClick={()=>setLanguage(language==="EN"?"SW":"EN")} className="btn-secondary">Language: {language === "EN" ? "English" : "Kiswahili"}</button>
          <button onClick={()=>setLowData(!lowData)} className="btn-secondary">Low-data: {lowData ? "On" : "Off"}</button>
          <button onClick={()=>setPage("blood")} className="btn-secondary">BloodConnect</button>
          <button onClick={()=>setPage("lab")} className="btn-secondary">Lab glossary</button>
          <button onClick={()=>setPage("maternal")} className="btn-secondary">MaternalCare</button>
        </div>
        <p className="mt-5 text-xs text-slate-400">MediLink MVP · For demonstration and product development. Health information here is general and not a diagnosis.</p>
      </section>
    </main>
  </div>;
}
