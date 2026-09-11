import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { useContractActions } from "../hooks/useContractActions";
import { useToasts } from "../context/ToastContext";
import { Field, TextInput, TextArea } from "../components/FormField";
import Reveal from "../components/Reveal";
import {
  CATEGORIES,
  NON_REFUNDABLE,
  REFUNDABLE,
  policyLabel,
  extractCid,
  ipfsUrl,
  isValidCid,
} from "../lib/crowdfunding";

const DAILY_MINUTES = 24 * 60;

export default function CreateProject() {
  const { isConnected, connect, account } = useWeb3();
  const { createProject } = useContractActions();
  const { success, error: notifyError } = useToasts();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    creatorName: "",
    projectLink: "",
    goal: "",
    duration: "",
    category: "0",
    refundPolicy: String(REFUNDABLE),
    cid: "",
  });
  const [errors, setErrors] = useState({});

  const patch = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setCategory = (value) => setForm((prev) => ({ ...prev, category: value }));

  const cid = useMemo(() => extractCid(form.cid), [form.cid]);
  const previewUrl = useMemo(() => (isValidCid(cid) ? ipfsUrl(cid) : ""), [cid]);
  const goal = Number(form.goal);
  const days = Number(form.duration);

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Give your project a name.";
    if (form.description.trim().length < 20) e.description = "Description should be at least 20 characters.";
    if (!form.creatorName.trim()) e.creatorName = "Tell backers who you are.";
    if (!form.cid.trim()) e.cid = "Provide an image CID or IPFS URL.";
    else if (!isValidCid(cid)) e.cid = "Invalid IPFS CID. Must start with Qm… or b…";
    if (form.projectLink.trim() && !/^https?:\/\/.+/i.test(form.projectLink.trim())) {
      e.projectLink = "Link must start with http(s)://";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.goal || Number.isNaN(goal) || goal <= 0) {
      e.goal = "Goal must be greater than 0.";
    } else if (!Number.isInteger(goal)) {
      e.goal = "Goal must be a whole Ether amount (e.g. 5, 10).";
    }
    if (!form.duration || Number.isNaN(days) || days <= 0) {
      e.duration = "Duration must be at least 1 day.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const onSubmit = async (evt) => {
    evt.preventDefault();
    if (!validateStep1() || !validateStep2()) {
      notifyError("Please verify your input fields.");
      return;
    }
    if (!isConnected) {
      notifyError("Connect your wallet to publish.");
      await connect();
      return;
    }
    setBusy(true);
    try {
      const receipt = await createProject(
        {
          name: form.name.trim(),
          description: form.description.trim(),
          creatorName: form.creatorName.trim(),
          projectLink: form.projectLink.trim(),
          goalEth: goal,
          durationMinutes: days * DAILY_MINUTES,
          category: Number(form.category),
          refundPolicy: Number(form.refundPolicy),
          cid,
        },
        () => success("Publishing project — waiting for confirmation…")
      );
      if (receipt.events) {
        const evt = receipt.events.find((x) => x && x.event === "ProjectCreated");
        const projectId = evt && evt.args && evt.args.projectId ? evt.args.projectId.toNumber() : null;
        success("Project created on-chain.");
        if (projectId !== null) {
          navigate(`/project/${projectId}`);
          return;
        }
      }
      navigate("/discover");
    } catch (err) {
      notifyError(err?.reason || err?.message || "Failed to create project.");
    } finally {
      setBusy(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container-page py-16 md:py-24">
        <Reveal className="mx-auto max-w-lg text-center">
          <div className="label-caps text-electric tracking-widest text-[11px]">Start a project</div>
          <h1 className="mt-6 text-4xl font-display font-black tracking-tight text-ink uppercase leading-none">Ready to launch?</h1>
          <p className="mt-6 text-ink-soft leading-relaxed font-sans">
            Create your campaign on-chain. Backers will fund in whole Ether, with automated refund guarantees handled by immutable smart contracts.
          </p>
          <button type="button" onClick={connect} className="btn-primary btn-lg mt-10 px-8 py-4">
            Connect Wallet to Continue
          </button>
          <div className="mt-4">
            <Link to="/discover" className="btn-outline btn-sm">
              Browse projects instead
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  const categoryLabelName = CATEGORIES.find(c => String(c.id) === String(form.category))?.label || "Design & Tech";

  return (
    <div className="container-page py-16 md:py-24">
      <Reveal className="mb-12 border-b border-outline-soft pb-8">
        <div className="label-caps text-electric tracking-widest text-[11px]">Creator Studio</div>
        <h1 className="mt-4 font-display font-black text-[clamp(2.5rem,6vw,4.5rem)] tracking-tight text-ink uppercase leading-none">
          Bring your idea to life.
        </h1>
        <p className="mt-4 text-base text-ink-soft max-w-xl font-sans">
          Create an on-chain campaign with transparent milestones and automated refund guarantees.
        </p>
      </Reveal>

      <Reveal className="mb-10 max-w-3xl mx-auto">
        <div className="relative flex items-center justify-between gap-1 border-b border-outline-soft pb-4 font-sans text-[10px] sm:text-xs">
          {[
            { n: 1, label: "01 IDEA" },
            { n: 2, label: "02 FUNDING" },
            { n: 3, label: "03 REVIEW" },
            { n: 4, label: "04 PUBLISH" },
          ].map((s) => {
            const active = step === s.n;
            const completed = step > s.n;
            return (
              <button
                key={s.n}
                type="button"
                onClick={() => {
                  if (s.n === 1) setStep(1);
                  if (s.n === 2 && validateStep1()) setStep(2);
                  if (s.n === 3 && validateStep1() && validateStep2()) setStep(3);
                }}
                className={`pb-2 border-b-2 transition-colors uppercase font-bold tracking-wider sm:tracking-widest ${
                  active
                    ? "border-electric text-electric"
                    : completed
                      ? "border-ink text-ink"
                      : "border-transparent text-ink-faint/40"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <div className="mt-2 text-[11px] text-ink-faint font-mono uppercase tracking-wider text-right">
          CONNECTED CREATOR: <span className="text-ink font-semibold">{account}</span>
        </div>
      </Reveal>

      <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
        <Reveal>
          <form onSubmit={onSubmit} noValidate className="card p-5 sm:p-8 bg-surface-bright border border-outline-soft shadow-sm rounded-cards">
            <div className="space-y-8">
              {step === 1 && (
                <section className="space-y-6">
                  <h2 className="font-display font-black text-xl text-ink uppercase tracking-wider">01 Project Details</h2>
                  
                  <Field label="Project Title" htmlFor="name" error={errors.name}>
                    <TextInput id="name" value={form.name} onChange={patch("name")} placeholder="e.g. Solar powered transportation" maxLength={80} />
                  </Field>

                  <Field label="Description" htmlFor="description" error={errors.description}>
                    <TextArea id="description" value={form.description} onChange={patch("description")} rows={6} placeholder="What are you building, and why should people back it?" maxLength={2000} />
                  </Field>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label="Creator Name" htmlFor="creatorName" error={errors.creatorName}>
                      <TextInput id="creatorName" value={form.creatorName} onChange={patch("creatorName")} placeholder="e.g. Alex Rivera" maxLength={80} />
                    </Field>
                    <Field label="Project External Link" htmlFor="projectLink" error={errors.projectLink} hint="Website, GitHub, or portfolio URL">
                      <TextInput id="projectLink" value={form.projectLink} onChange={patch("projectLink")} placeholder="https://…" inputMode="url" />
                    </Field>
                  </div>

                  <div className="pt-2">
                    <span className="field-label">Category</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {CATEGORIES.map((c) => {
                        const active = Number(form.category) === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCategory(String(c.id))}
                            className={`rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                              active ? "border-ink bg-navy text-surface-bright" : "border-outline-soft text-ink-soft hover:border-ink/30 hover:text-ink"
                            }`}
                          >
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Field
                    label="Project Cover Image CID or IPFS Link"
                    htmlFor="cid"
                    error={errors.cid}
                    hint="IPFS CID (Qm... or baf...) resolves image gateway"
                  >
                    <TextInput id="cid" value={form.cid} onChange={patch("cid")} placeholder="Qm… or https://ipfs.io/ipfs/…" />
                  </Field>
                </section>
              )}

              {step === 2 && (
                <section className="space-y-6">
                  <h2 className="font-display font-black text-xl text-ink uppercase tracking-wider">02 Campaign Funding Parameters</h2>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field
                      label="Funding Goal (ETH)"
                      htmlFor="goal"
                      error={errors.goal}
                      hint="Whole numbers only (e.g. 5, 10, 50)"
                    >
                      <TextInput id="goal" type="number" min="1" step="1" inputMode="numeric" value={form.goal} onChange={patch("goal")} placeholder="e.g. 10" />
                    </Field>
                    <Field label="Duration (days)" htmlFor="duration" error={errors.duration} hint="Number of days campaign will run">
                      <TextInput id="duration" type="number" min="1" step="1" inputMode="numeric" value={form.duration} onChange={patch("duration")} placeholder="e.g. 30" />
                    </Field>
                  </div>

                  <div className="pt-4 border-t border-outline-soft">
                    <span className="field-label">Refund Policy</span>
                    <div className="grid gap-4 sm:grid-cols-2 mt-3">
                      {[REFUNDABLE, NON_REFUNDABLE].map((policy) => {
                        const active = Number(form.refundPolicy) === policy;
                        return (
                          <button
                            key={policy}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, refundPolicy: String(policy) }))}
                            className={`rounded-md border p-5 text-left transition-colors ${
                              active ? "border-electric bg-electric/5" : "border-outline-soft hover:border-ink/25"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-electric" : "bg-ink/20"}`} />
                              <span className="text-sm font-bold text-ink uppercase tracking-wider">{policyLabel(policy)}</span>
                            </div>
                            <p className="mt-3 text-xs leading-relaxed text-ink-soft font-sans font-normal">
                              {policy === REFUNDABLE
                                ? "Backers receive a full automatic refund if the campaign finishes below the funding goal."
                                : "All contributions go directly to the creator regardless of whether the goal is achieved."}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}

              {step === 3 && (
                <section className="space-y-6">
                  <h2 className="font-display font-black text-xl text-ink uppercase tracking-wider">03 Project Summary Review</h2>
                  <p className="text-sm text-ink-soft leading-relaxed font-sans">
                    Please review all parameters of your project. Once you publish to the blockchain, these details are stored immutably and cannot be updated.
                  </p>
                  
                  <div className="border border-outline-soft rounded-md bg-surface-container-low p-5 divide-y divide-outline-soft">
                    {[
                      ["Project Title", form.name],
                      ["Creator Name", form.creatorName],
                      ["Category", categoryLabelName],
                      ["Funding Goal", `${goal} ETH`],
                      ["Duration", `${days} days`],
                      ["Refund Policy", policyLabel(Number(form.refundPolicy))],
                      ["CID", cid],
                      ["External URL", form.projectLink || "None provided"],
                    ].map(([label, value]) => (
                      <div key={label} className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                        <span className="text-xs font-bold text-ink-faint uppercase tracking-wider">{label}</span>
                        <span className="text-sm font-mono text-ink font-semibold break-all text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {step === 4 && (
                <section className="space-y-6 text-center py-6">
                  <h2 className="font-display font-black text-2xl text-ink uppercase tracking-wider">04 Immutably Publish</h2>
                  <p className="max-w-md mx-auto text-sm text-ink-soft leading-relaxed font-sans">
                    Your campaign parameters are correct. Click below to execute a MetaMask smart contract transaction. This action will incur Ethereum gas fees.
                  </p>
                  <div className="p-4 rounded-md bg-danger/5 border border-danger/10 text-danger text-xs max-w-md mx-auto leading-relaxed font-sans">
                    <strong>Notice:</strong> All project actions, payouts, and contributions are governed by on-chain consensus. Ensure cover images are pinned correctly.
                  </div>
                </section>
              )}

              <div className="flex items-center justify-between border-t border-outline-soft pt-6">
                {step > 1 ? (
                  <button type="button" onClick={handlePrevStep} className="btn-outline px-6 py-2.5 font-bold uppercase text-xs">
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button type="button" onClick={handleNextStep} className="btn-primary px-6 py-2.5 font-bold uppercase text-xs">
                    Next Step
                  </button>
                ) : (
                  <button type="submit" disabled={busy} className="btn-electric btn-lg px-8 py-3.5 font-bold uppercase text-xs">
                    {busy ? "Publishing to blockchain…" : "Publish Project"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </Reveal>

        <Reveal className="hidden lg:block lg:sticky lg:top-28">
          <div className="card overflow-hidden border border-outline-soft shadow-sm bg-surface-bright rounded-cards">
            <div className="aspect-video w-full bg-navy relative overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center">
                  <span className="font-mono text-xs text-surface-bright/50">Cover Image Preview</span>
                </div>
              )}
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="label-caps text-electric tracking-widest text-[9px]">{categoryLabelName}</div>
                <h3 className="mt-2 text-lg font-bold text-ink truncate uppercase">{form.name || "Untitled Campaign"}</h3>
                <div className="text-xs text-ink-soft mt-1">by {form.creatorName || "Creator Name"}</div>
              </div>
              <div className="border-t border-outline-soft pt-4 divide-y divide-outline-soft text-xs">
                {[
                  ["Goal", goal > 0 ? `${goal} ETH` : "—"],
                  ["Duration", days > 0 ? `${days} days` : "—"],
                  ["Policy", policyLabel(Number(form.refundPolicy))],
                ].map(([label, value]) => (
                  <div key={label} className="py-2 flex justify-between">
                    <span className="text-ink-faint">{label}</span>
                    <span className="font-mono text-ink font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}