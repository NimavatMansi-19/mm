import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Section from "@/app/components/Section";
import PageHeader from "@/app/components/PageHeader";
import Card from "@/app/components/Card";
import BackButton from "@/app/components/BackButton";
import Link from "next/link";
import { User, Mail, Phone, Calendar, Clock, UserCheck, UserX, BarChart3, ChevronRight, ShieldCheck, FileText } from "lucide-react";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
    const session = await requireUser();

    let userData: any = null;
    let attendanceData: any[] = [];
    let isStaff = false;

    // Fetch primary user data from users table
    const userAccount = await prisma.users.findUnique({
        where: { email: session.email }
    });

    // If staff, fetch additional details
    if (session.StaffID || session.role === 'staff') {
        const staffRecord = await prisma.staff.findFirst({
            where: { 
                OR: [
                    { StaffID: session.StaffID ? Number(session.StaffID) : -1 },
                    { EmailAddress: session.email }
                ]
            },
            include: {
                meetingmember: {
                    include: {
                        meetings: {
                            include: {
                                meetingtype: true
                            }
                        }
                    },
                    orderBy: {
                        meetings: {
                            MeetingDate: 'desc'
                        }
                    }
                }
            }
        });

        if (staffRecord) {
            userData = {
                name: staffRecord.StaffName,
                email: staffRecord.EmailAddress,
                phone: staffRecord.MobileNo,
                role: session.role || 'staff',
                profilePic: (staffRecord as any).profilePic || (userAccount as any)?.profilePic,
                remarks: staffRecord.Remarks
            };
            attendanceData = staffRecord.meetingmember;
            isStaff = true;
        }
    }

    // Default to userAccount data if not staff or staff record not found
    if (!userData && userAccount) {
        userData = {
            name: userAccount.name,
            email: userAccount.email,
            phone: null,
            role: userAccount.role,
            profilePic: (userAccount as any).profilePic
        };
    }

    if (!userData) {
        redirect("/dashboard");
    }

    const totalInvites = attendanceData.length;
    const attendedSessions = attendanceData.filter(m => m.IsPresent).length;
    const absentSessions = totalInvites - attendedSessions;
    const attendanceRate = totalInvites > 0 ? Math.round((attendedSessions / totalInvites) * 100) : 0;

    return (
        <div className="min-h-full pb-20 bg-slate-50/50">
            <Section className="pt-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <BackButton href="/dashboard" />
                </div>

                <PageHeader
                    title="My Profile"
                    description="View your personal information, manage your profile picture, and view activity."
                    icon={User}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                    {/* Left Column - Personal Info */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="text-center overflow-visible">
                            <ProfileClient 
                                initialImage={userData.profilePic} 
                                userName={userData.name || "User"} 
                            />
                            
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight line-clamp-1 mt-4">{userData.name || "No Name"}</h2>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                    userData.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 
                                    userData.role === 'meeting_convener' ? 'bg-amber-100 text-amber-700' : 
                                    'bg-slate-100 text-slate-700'
                                }`}>
                                    {userData.role === 'admin' && <ShieldCheck size={10} />}
                                    {userData.role?.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-4 text-left">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                                        <Mail size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                                        <p className="text-sm font-medium text-gray-800 break-all">{userData.email || "Not set"}</p>
                                    </div>
                                </div>
                                {userData.phone && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                                            <Phone size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile Contact</p>
                                            <p className="text-sm font-medium text-gray-800">{userData.phone}</p>
                                        </div>
                                    </div>
                                )}
                                {userData.remarks && (
                                    <div className="flex items-start gap-3 mt-2 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                                        <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                                            <FileText size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Remarks</p>
                                            <p className="text-xs font-medium text-amber-900 leading-relaxed italic">{userData.remarks}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {isStaff && (
                            <Card title="Attendance Performance">
                                <div className="flex items-center gap-4 mb-6 mt-2">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                        <BarChart3 size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-end mb-1">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Overall Present Rate</p>
                                            <p className="text-lg font-bold text-indigo-700">{attendanceRate}%</p>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${attendanceRate >= 80 ? 'bg-green-500' :
                                                    attendanceRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                                    }`}
                                                style={{ width: `${attendanceRate}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 text-center">
                                        <UserCheck size={20} className="text-green-600 mx-auto mb-2" />
                                        <p className="text-2xl font-black text-green-700">{attendedSessions}</p>
                                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1">Attended</p>
                                    </div>
                                    <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 text-center">
                                        <UserX size={20} className="text-rose-600 mx-auto mb-2" />
                                        <p className="text-2xl font-black text-rose-700">{absentSessions}</p>
                                        <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-1">Absent</p>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Activity/History */}
                    <div className="md:col-span-2 space-y-6">
                        {isStaff ? (
                            <Card title="Meeting History & Invites">
                                <div className="space-y-4">
                                    {totalInvites === 0 ? (
                                        <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                            <Calendar size={32} className="mx-auto text-slate-300 mb-3" />
                                            <p className="font-medium">You have not been assigned to any meetings yet.</p>
                                        </div>
                                    ) : (
                                        attendanceData.map((member) => (
                                            <div key={member.MeetingMemberID} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50 transition-colors group">
                                                <div className="flex items-start gap-4">
                                                    <div className={`mt-1 p-2 rounded-lg border shadow-sm ${member.IsPresent
                                                        ? 'bg-green-50 border-green-200 text-green-600'
                                                        : 'bg-rose-50 border-rose-200 text-rose-600'
                                                        }`}>
                                                        {member.IsPresent ? <UserCheck size={18} /> : <UserX size={18} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                                            {member.meetings.meetingtype?.MeetingTypeName || "General Meeting"}
                                                            {member.IsPresent ? (
                                                                <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full uppercase tracking-widest">Present</span>
                                                            ) : (
                                                                <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full uppercase tracking-widest">Absent</span>
                                                            )}
                                                        </h4>
                                                        <div className="mt-1 flex items-center gap-3 text-sm font-medium text-slate-500">
                                                            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> {new Date(member.meetings.MeetingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                            <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {new Date(member.meetings.MeetingDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Link
                                                    href={`/meetings/${member.MeetingID}`}
                                                    className="shrink-0 inline-flex items-center gap-1 px-4 py-2 sm:px-3 sm:py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
                                                >
                                                    View Details <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                                </Link>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                <Card title="Administrative Access">
                                    <div className="p-8 text-center bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                        <ShieldCheck size={48} className="mx-auto text-indigo-500 mb-4" />
                                        <h3 className="text-lg font-bold text-indigo-900 mb-2">Full System Privileges</h3>
                                        <p className="text-sm text-indigo-700 max-w-md mx-auto leading-relaxed">
                                            As an {userData.role === 'admin' ? 'Administrator' : 'Meeting Convener'}, you have comprehensive access to manage meetings, staff, and system configurations.
                                        </p>
                                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Link href="/staff" className="p-4 bg-white rounded-xl border border-indigo-100 hover:shadow-md transition-shadow text-left group">
                                                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Manage</p>
                                                <p className="font-bold text-gray-900 group-hover:text-indigo-600 flex items-center justify-between">
                                                    Staff Members <ChevronRight size={16} />
                                                </p>
                                            </Link>
                                            <Link href="/meetings" className="p-4 bg-white rounded-xl border border-indigo-100 hover:shadow-md transition-shadow text-left group">
                                                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Manage</p>
                                                <p className="font-bold text-gray-900 group-hover:text-indigo-600 flex items-center justify-between">
                                                    All Meetings <ChevronRight size={16} />
                                                </p>
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                                
                                <Card title="Security & Account">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                            <div>
                                                <p className="font-bold text-gray-900">Email Verification</p>
                                                <p className="text-xs text-slate-500 font-medium tracking-tight">Your account email is verified and secure.</p>
                                            </div>
                                            <div className="bg-green-100 text-green-700 p-1.5 rounded-full">
                                                <ShieldCheck size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </Section>
        </div>
    );
}
