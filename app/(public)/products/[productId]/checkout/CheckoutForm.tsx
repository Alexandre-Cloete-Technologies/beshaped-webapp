"use client";

import { useState, useId } from "react";
import { TbLock, TbLoader2, TbCircleCheck } from "react-icons/tb";
import { Product } from "@/features/products/types/productTypes";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const checkoutSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.email("Invalid email"),
});

type CheckoutInput = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  product: Pick<Product, "id" | "title" | "price" | "currency">;
}

interface FormState {
  name: string;
  email: string;
}

interface Errors {
  name?: string;
  email?: string;
}

function validate(values: FormState): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) {
    errors.name = "Full name is required.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Please enter your full name.";
  }
  if (!values.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }
  return errors;
}

export default function CheckoutForm({ product }: CheckoutFormProps) {

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const nameId = useId();
  const emailId = useId();

  const [form, setForm] = useState<FormState>({ name: "", email: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const formattedPrice = new Intl.NumberFormat("en-NA", {
    style: "currency",
    currency: product.currency ?? "NAD",
    minimumFractionDigits: 2,
  }).format(product.price);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name as keyof FormState]) {
      setErrors((prev) => ({
        ...prev,
        ...validate({ ...form, [name]: value }),
      }));
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate({ ...form, [name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ name: true, email: true });
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("submitting");
    // TODO: wire up to payment provider / server action
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <TbCircleCheck className="h-16 w-16 text-[#00a62c]" strokeWidth={1.25} />
        <h2 className="mt-6 text-xl font-black uppercase tracking-tight text-zinc-900">
          Order received!
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-500">
          Thanks, <strong>{form.name.split(" ")[0]}</strong>! A confirmation has been sent to{" "}
          <strong>{form.email}</strong>. You&apos;ll receive your download link shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Name */}
      <div>
        <label
          htmlFor={nameId}
          className="block text-xs font-bold uppercase tracking-widest text-zinc-500"
        >
          Full name
        </label>
        <input
          id={nameId}
          name="name"
          type="text"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Alex Smith"
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
          aria-invalid={!!errors.name}
          className={`mt-2 w-full border bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-300 outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 ${errors.name ? "border-red-500" : "border-zinc-300"
            }`}
        />
        {errors.name && (
          <p id={`${nameId}-error`} className="mt-1.5 text-xs text-red-600" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor={emailId}
          className="block text-xs font-bold uppercase tracking-widest text-zinc-500"
        >
          Email address
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="alex@example.com"
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
          aria-invalid={!!errors.email}
          className={`mt-2 w-full border bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-300 outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 ${errors.email ? "border-red-500" : "border-zinc-300"
            }`}
        />
        {errors.email && (
          <p id={`${emailId}-error`} className="mt-1.5 text-xs text-red-600" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-2 flex w-full items-center justify-center gap-2 bg-[#00a62c] py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[#6aaa1e] disabled:opacity-60"
      >
        {status === "submitting" ? (
          <>
            <TbLoader2 className="h-4 w-4 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <TbLock className="h-4 w-4" />
            Complete purchase · {formattedPrice}
          </>
        )}
      </button>

      <p className="text-center text-xs text-zinc-400">
        By completing your purchase you agree to our terms of service.
      </p>
    </form>
  );
}
