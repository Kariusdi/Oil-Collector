"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import En from "@/assets/en.webp";
import Th from "@/assets/th.webp";
import Piggy from "@/assets/piggy-bank.webp";
import Plant from "@/assets/plant.webp";
import Money from "@/assets/money.webp";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import realtimeDB from "@/utils/realtimeDB";
import { ref, onValue } from "firebase/database";
import Logo from "@/assets/logo.webp";

const InstructionPage = () => {
  const [selectedMenu, setSelectedMenu] = useState<string>("");
  const [locale, setLocale] = useState<string>("");
  const router = useRouter();
  const t = useTranslations("WelcomePage");

  const [oilTotal, setOilTotal] = useState<number>(0);

  useEffect(() => {
    const oilTotalRef = ref(realtimeDB, "oilTotal");
    const unsubscribe = onValue(oilTotalRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setOilTotal(data);
      } else {
        console.log("No data available");
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const cookieLocale = document.cookie
      .split("; ")
      .find((row) => row.startsWith("NEXTAPP_LOCALE="))
      ?.split("=")[1];
    if (cookieLocale) {
      setLocale(cookieLocale);
    } else {
      const browserLocale = navigator.language.slice(0, 2);
      setLocale(browserLocale);
      document.cookie = `NEXTAPP_LOCALE=${browserLocale};`;
      router.refresh();
    }
  }, [router]);

  const changeLocale = useCallback(
    (newLocale: string) => {
      setLocale(newLocale);
      document.cookie = `NEXTAPP_LOCALE=${newLocale};`;
      router.refresh();
    },
    [router]
  );

  const menus = useMemo(() => {
    return [
      {
        name: t("menu1"),
        image: Money,
        endpoint: "collector",
      },
      {
        name: t("menu2"),
        image: Piggy,
        endpoint: "sales",
      },
      {
        name: t("menu3"),
        image: Plant,
        endpoint: "credits",
      },
    ];
  }, [locale, t]);

  return (
    <>
      {oilTotal >= 90 && <p>The tank is full, not available now.</p>}
      {locale !== "" && oilTotal < 90 && (
        <section className="relative flex flex-col justify-center items-center w-full h-full space-y-20">
          <div className="space-y-5 flex flex-col justify-center items-center">
            {/* <h3 className="text-h3 text-secondary">{t("title")}</h3> */}
            <Image
              src={Logo}
              alt="logo"
              width={200}
              height={200}
              quality={100}
              className="-mb-8"
              priority
            />
            <h2 className="text-h2 text-secondary font-medium">
              {t("greeting")}
            </h2>
            <div
              onClick={() => changeLocale(locale === "th" ? "en" : "th")}
              className="flex justify-center items-center border-2 border-secondary text-secondary rounded-xl px-4 py-2 space-x-5 w-fit"
            >
              <Image
                src={locale === "th" ? En : Th}
                alt="arrow down"
                width={50}
                height={50}
                quality={100}
                placeholder="empty"
                priority
              />
              <p className="font-medium text-h4">
                Change to {locale === "th" ? "En" : "Th"}
              </p>
            </div>
          </div>
          <div className="space-y-5 w-full">
            <h1 className="text-h1 text-tertiary font-bold">
              {t("instruction")}
            </h1>
            <div className="flex justify-evenly items-center w-full">
              {menus.map((menu, index) => (
                <div
                  onClick={() => {
                    if (selectedMenu === menu.endpoint) return;
                    setSelectedMenu(menu.endpoint);
                  }}
                  key={index}
                  className={`h-56 w-56 p-2 flex flex-col justify-center items-center rounded-full shadow-[0px_0px_30px_rgba(0,0,0,0.1)] shadow-primary ${
                    selectedMenu === menu.endpoint
                      ? "bg-primary text-white"
                      : "bg-white"
                  } text-tertiary space-y-2`}
                >
                  <p className="font-medium text-h4">{menu.name}</p>
                  <Image
                    src={menu.image}
                    alt="menu"
                    width={80}
                    height={80}
                    quality={100}
                    placeholder="empty"
                    priority
                  />
                </div>
              ))}
            </div>
          </div>
          <h4
            onClick={() => router.push(`/register?from=${selectedMenu}`)}
            className={`text-h4 text-tertiary animate-bounce w-full ${
              selectedMenu ? "opacity-100" : "opacity-0"
            }`}
          >
            {t("tab")}
          </h4>
          <div className="absolute bottom-0 flex justify-between items-center w-full text-2xl p-5 text-secondary-light">
            <p>{t("report")}</p>
            <p>{t("contact")}</p>
          </div>
        </section>
      )}
    </>
  );
};

export default InstructionPage;
