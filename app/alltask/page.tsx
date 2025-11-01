"use client";
import Image from "next/image";
import task from "./../../assets/images/task.png";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { supabase } from "./../../lib/supabaseClient";

//สร้างประเภทข้อมูลแบบ Task
type Task = {
    id: string;
    created_at: string;
    title: string;
    detail: string;
    image_url: string;
    is_completed: boolean;
    update_at: string;
}

export default function Page() {
    // สร้าง state สำหรับเก็บรายการงาน
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        // Fetch Data จาก Supabase
        const fetchTasks = async () => {
            const { data, error } = await supabase
                .from("task_tb")
                .select("id, created_at, title, detail, image_url, is_completed, update_at") // หรือ .select("*") ถ้าต้องการทุกคอลัมน์
                .order("created_at", { ascending: false }); // เรียงลำดับจากใหม่ไปเก่า
            
                // ตรวจสอบ Error ก่อน
                if (error) {
                    alert("เกิดข้อผิดพลาดในการดึงข้อมูลงาน");
                    console.error("Error fetching tasks:", error.message)
                    return;
                }
                
                // ถ้าไม่มี Error ให้เอา data ลงใน state
                if(data) {
                    setTasks(data as Task[]);
                }
                
        };
        fetchTasks();
    }, []);

    const handleDeleteClick = async (id: string) => {
        if (confirm("คุณต้องการลบงานนี้ใช่หรือไม่?")) {
            // ลบงาน ถ้า user กด ตกลง
            const {data, error} = await supabase
            .from("task_tb")
            .delete()
            .eq("id", id) // eq = equal โดยกำหนดเงื่อนไขที่ id เท่ากับ id ที่ส่งมา
        
        if (error) {
            alert("เกิดข้อผิดพลาดในการลบงาน");
            console.error("Error deleting task:", error.message);
            return;
        }
        
        // อัพเดท State tasks โดยการกรองเอาเฉพาะงานที่ id ไม่ตรงกับ id ที่ลบ
        setTasks(tasks.filter((task) => task.id !== id));

        alert("ลบงานเรียบร้อยแล้ว");

        }
    }

  return (
    <>
      <div className="flex flex-col items-center text-center mt-10">
        <Image className="mt-5" src={task} alt="Task" width={150} />

        <h1 className="mt-5 text-2xl font-bold text-blue-700">
          My George Task App
        </h1>

        <div className="flex justify-end w-9/12">
           <Link href={"/addtask"} className="mt-6 px-10 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
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
                {tasks.map((task) =>(
                    <tr key={task.id}>
                        <td className="border p-2 text-center">
                            {
                                task.image_url 
                                ? <Image
                                    className="mx-auto"
                                    src={task.image_url}
                                    alt={task.title}
                                    width={80}
                                    height={80}
                                  />
                                : "-"
                            }     
                        </td>
                        <td className="border p-2"> {task.title} </td>
                        <td className="border p-2"> {task.detail} </td>
                        <td className="border p-2"> {task.is_completed === true ? "เสร็จสิ้น" : "ยังไม่เสร็จ"} </td>
                        <td className="border p-2"> {new Date(task.created_at).toLocaleString("th-TH")} </td>
                        <td className="border p-2"> {new Date(task.update_at).toLocaleString("th-TH")} </td>
                        <td className="border p-2 text-xl font-bold"> 
                            <Link className="text-green-800 mr-5" href= {`/updatetask/${task.id}`}>
                                แก้ไข
                            </Link>
                            <button onClick={()=>handleDeleteClick(task.id)} className="text-red-500 cursor-pointer hover:underline">ลบ</button>
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
