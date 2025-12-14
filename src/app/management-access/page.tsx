import Link from "next/link";

export default function ManagementAccessPage() {
  const options = [
    {
      title: "ورود مدیران مسجد",
      description: "دسترسی به میز مدیریت، گزارش‌ها و تنظیمات کلیدی مسجد",
      href: "/auth/login",
    },
    {
      title: "ورود اعضای فعال پایگاه بسیج",
      description: "دسترسی سریع برای خادمین و نیروهای عملیاتی پایگاه",
      href: "/basij/login",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4faf6]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(14,165,233,0.18),_transparent_60%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-5 py-10 text-[#0a1e16]">
        <div className="rounded-3xl p-6 text-center sm:p-10">
          <p className="text-sm text-emerald-900">دسترسی به پنل‌های مدیریتی</p>
          <h1 className="mt-3 text-3xl font-black leading-[2.75rem] text-[#092015] sm:text-4xl">
            آیا جزو مدیران مسجد یا اعضای فعال پایگاه هستید؟
          </h1>
          <p className="mt-4 text-base text-[#1c3a2d] sm:text-lg">
            برای حفاظت از اطلاعات و مدیریت خادمین، لطفاً گزینه‌ای که به نقش شما مربوط است
            انتخاب کنید. پس از انتخاب، به صفحه ورود مخصوص همان نقش هدایت خواهید شد.
          </p>
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          {options.map((option) => (
            <div
              key={option.title}
              className="group flex h-full flex-col rounded-3xl bg-white/30 p-6 shadow-[0_35px_120px_rgba(15,118,110,0.25)] backdrop-blur-[18px] transition duration-200 hover:-translate-y-1.5"
            >
              <h2 className="text-[26px] font-black leading-snug text-[#081a13]">{option.title}</h2>
              <p className="mt-4 flex-1 text-base leading-8 text-[#1d3f31]">
                {option.description}
              </p>
              <Link
                href={option.href}
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-l from-emerald-500 via-emerald-400 to-lime-400 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-400/60 transition hover:-translate-y-0.5 sm:px-6"
              >
                ادامه فرآیند ورود
              </Link>
            </div>
          ))}
        </section>

        <div className="rounded-3xl p-6 text-[#082219]">
          <p className="text-lg font-semibold leading-9">
            اگر هنوز حساب کاربری شما ایجاد نشده یا نیاز به پشتیبانی دارید، از طریق فرماندهی پایگاه بسیج امام جعفر صادق (ع) درخواست ثبت نام جدید ارسال کنید.
          </p>
        </div>
      </div>
    </main>
  );
}
