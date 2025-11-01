import Image from "next/image";
import task from "./../assets/images/task.png"
import Link from "next/link";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center text-center m-10">
        <Image className="mt-15" src={task} alt="Task" width={200} />

        <h1 className="mt-10 text-3xl text-blue-700">
          <span className="font-bold text-4xl">Manage Task App</span>
        </h1>

        <h1 className="text-2xl text-blue-700 mt-5">
          บริหารจัดการงานที่ทำ
        </h1>

        <Link href={"/alltask"} className=" mt-10 px-25 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          เข้าใฃ้งานแอปพลิเคชั่น
        </Link>

        <Footer />
      </div>
    </>
  );
}
