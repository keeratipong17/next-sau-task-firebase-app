"use client";
import Image from "next/image";
import task from "./../../assets/images/task.png";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseCilents";
import { firestore } from "../../lib/firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

//สร้างประเภทข้อมูลแบบ Task
type Task = {
  id: string;
  created_at: string; // เดิมสะกด create_at -> ให้ตรงกับ select
  title: string;
  detail: string;
  image_url: string;
  is_completed: boolean;
  update_at: string;
};

export default function Page() {
  // สร้าง state สำหรับเก็บรายการงาน
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      
      try {
        // ดึงข้อมูลจาก Firestore
        const data = await getDocs(collection(firestore, "task_cl"));

        // เอาข้อมูลที่ดึงมากำหนดลงใน state
        setTasks(
          data.docs.map((doc) => ({
            id: doc.id,
            title: doc.data().title,
            detail: doc.data().detail,
            image_url: doc.data().image_url,
            is_completed: doc.data().is_completed,
            created_at: doc.data().created_at?.toDate() ?? null,
            update_at: doc.data().update_at?.toDate() ?? null,
          }))
        );
      } catch (error) {
        console.error("Error fetching tasks:", error);
        alert("เกิดข้อผิดพลาดในการดึงข้อมูลงาน กรุณาลองใหม่อีกครั้ง");
      }
    };

    fetchTasks();
  }, []);

  const handleDeleteClick = async (id: string) => {
    if (confirm("คุณแน่ใจหรือว่าต้องการลบงานนี้?")) {
      // ลบข้อมูลใน Firestore
      await deleteDoc(doc(firestore, "task_cl", id));

      // อัพเดท State โดยการกรองเอางานที่ถูกลบออก
      setTasks(tasks.filter((task) => task.id !== id));

      alert("ลบงานเรียบร้อยแล้ว");
    }
  };

  return (
    <>
      <div className="flex flex-col items-center text-center mt-10">
        <Image className="mt-5" src={task} alt="Task" width={150} />

        <h1 className="mt-5 text-2xl font-bold text-blue-700">
          Manage Task App
        </h1>
        <h1 className="mt-5 text-2xl text-gray-400">บริการจัดการงานที่ทำ</h1>


        <div className="flex justify-end w-9/12">
          <Link
            href={"/addtask"}
            className="mt-6 px-10 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            เพิ่มงาน
          </Link>
        </div>

        {/* ส่วนแสดงรายการงานทั้งหมด */}

        <div className="flex w-9/12 mt-5">
          <table className="w-full border">
            {/* หัวตาราง */}
            <thead>
              <tr className="text-center font-bold bg-gray-200">
                <td className="border p-2">รูป</td>
                <td className="border p-2">งานที่ต้องทำ</td>
                <td className="border p-2">รายละเอียดงาน</td>
                <td className="border p-2">สถานะ</td>
                <td className="border p-2">วันที่เพิ่ม</td>
                <td className="border p-2">วันที่แก้ไข</td>
                <td className="border p-2">Action</td>
              </tr>
            </thead>
            {/* เนื้อหาในตาราง */}
            <tbody>
              {/* Loop เอาข้อมูลใน State Tasks มาแสดงที่ละแถว */}
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="border p-2 text-center">
                    {task.image_url ? (
                      <Image
                        className="mx-auto"
                        src={task.image_url}
                        alt={task.title}
                        width={80}
                        height={80}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="border p-2"> {task.title} </td>
                  <td className="border p-2"> {task.detail} </td>
                  <td className="border p-2">
                    {" "}
                    {task.is_completed === true
                      ? "เสร็จสิ้น"
                      : "ยังไม่เสร็จ"}{" "}
                  </td>
                  <td className="border p-2">
                    {" "}
                    {new Date(task.created_at).toLocaleString("th-TH")}{" "}
                  </td>
                  <td className="border p-2">
                    {" "}
                    {new Date(task.update_at).toLocaleString("th-TH")}{" "}
                  </td>
                  <td className="border p-2 text-xl font-bold">
                    <Link
                      className="text-green-800 mr-5"
                      href={`/updatetask/${task.id}`}
                    >
                      แก้ไข
                    </Link>

                    <button
                      onClick={() => handleDeleteClick(task.id)}
                      className="text-red-500 cursor-pointer hover:underline"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
