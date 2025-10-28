import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchEventsByDateRange,
  createEvent,
  updateEvent,
  deleteEvent,
  clearError,
} from "../../features/events/eventsSlice";
import toast from "react-hot-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { Event, CreateEventData } from "../../types";

export default function CalendarPage() {
  const dispatch = useAppDispatch();
  const { events, loading, error } = useAppSelector((state) => state.events);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState<CreateEventData>({
    title: "",
    description: "",
    eventType: "meeting",
    category: "company",
    startDate: "",
    endDate: "",
    location: "",
    isAllDay: false,
    color: "#3B82F6",
    status: "scheduled",
  });

  useEffect(() => {
    document.title = "日历 - eFront 私募基金管理系统";
    loadEventsForMonth(currentDate);
  }, [currentDate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const loadEventsForMonth = (date: Date) => {
    const start = startOfWeek(startOfMonth(date));
    const end = endOfWeek(endOfMonth(date));
    dispatch(
      fetchEventsByDateRange({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      })
    );
  };

  const getDaysInMonth = () => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  };

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;
      return (
        (isSameDay(day, eventStart) || isSameDay(day, eventEnd)) ||
        (day >= eventStart && day <= eventEnd)
      );
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setEventForm({
      ...eventForm,
      startDate: format(day, "yyyy-MM-dd'T'HH:mm"),
      endDate: format(day, "yyyy-MM-dd'T'HH:mm"),
    });
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || "",
      eventType: event.eventType || "meeting",
      category: event.category || "company",
      startDate: format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm"),
      endDate: event.endDate
        ? format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm")
        : "",
      location: event.location || "",
      isAllDay: event.isAllDay,
      color: event.color || "#3B82F6",
      status: event.status,
    });
    setShowEventModal(true);
  };

  const handleSubmit = async () => {
    if (!eventForm.title || !eventForm.startDate) {
      toast.error("请填写事件标题和开始时间");
      return;
    }

    try {
      if (editingEvent) {
        await dispatch(updateEvent({ id: editingEvent.id, data: eventForm })).unwrap();
        toast.success("事件已更新");
      } else {
        await dispatch(createEvent(eventForm)).unwrap();
        toast.success("事件已创建");
      }
      setShowEventModal(false);
      loadEventsForMonth(currentDate);
    } catch (error: any) {
      toast.error(error?.message || "操作失败");
    }
  };

  const handleDelete = async () => {
    if (!editingEvent || !confirm(`确定要删除事件 "${editingEvent.title}" 吗？`)) return;

    try {
      await dispatch(deleteEvent(editingEvent.id)).unwrap();
      toast.success("事件已删除");
      setShowEventModal(false);
      loadEventsForMonth(currentDate);
    } catch (error: any) {
      toast.error(error?.message || "删除失败");
    }
  };

  const days = getDaysInMonth();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-black dark:text-white">日历</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          管理重要日期、会议和截止日期
        </p>
      </div>

      {/* Calendar Controls */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevMonth}
                className="inline-flex items-center justify-center rounded-full bg-gray-2 p-2 hover:bg-gray-3 dark:bg-meta-4 dark:hover:bg-meta-5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-xl font-semibold text-black dark:text-white min-w-40 text-center">
                {format(currentDate, 'yyyy年MM月')}
              </h3>
              <button
                onClick={handleNextMonth}
                className="inline-flex items-center justify-center rounded-full bg-gray-2 p-2 hover:bg-gray-3 dark:bg-meta-4 dark:hover:bg-meta-5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleToday}
                className="rounded bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90"
              >
                今天
              </button>
              <button
                onClick={() => {
                  setSelectedDate(new Date());
                  setEditingEvent(null);
                  setEventForm({
                    ...eventForm,
                    startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                    endDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                  });
                  setShowEventModal(true);
                }}
                className="rounded bg-meta-3 py-2 px-6 font-medium text-white hover:bg-opacity-90"
              >
                创建事件
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="p-6">
          {/* Week Days */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-black dark:text-white py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-24 p-2 border border-stroke dark:border-strokedark rounded cursor-pointer transition-colors ${
                    isCurrentMonth
                      ? 'bg-white dark:bg-boxdark hover:bg-gray-2 dark:hover:bg-meta-4'
                      : 'bg-gray-1 dark:bg-meta-4 opacity-50'
                  } ${isToday ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : 'text-black dark:text-white'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => handleEventClick(event, e)}
                        className="text-xs p-1 rounded truncate hover:opacity-80"
                        style={{ backgroundColor: event.color || '#3B82F6', color: 'white' }}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        +{dayEvents.length - 2} 更多
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30"
            style={{ zIndex: 100000 }}
            onClick={() => setShowEventModal(false)}
          />
          <div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ zIndex: 100001 }}
          >
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex items-center justify-between">
                <h3 className="font-medium text-black dark:text-white">
                  {editingEvent ? '编辑事件' : '创建事件'}
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6.5">
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    事件标题 <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="请输入事件标题"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4.5">
                  <div>
                    <label className="mb-2.5 block text-black dark:text-white">类型</label>
                    <select
                      value={eventForm.eventType}
                      onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                    >
                      <option value="meeting">会议</option>
                      <option value="deadline">截止日期</option>
                      <option value="milestone">里程碑</option>
                      <option value="holiday">假期</option>
                      <option value="reminder">提醒</option>
                      <option value="other">其他</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2.5 block text-black dark:text-white">分类</label>
                    <select
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                    >
                      <option value="fund">基金</option>
                      <option value="investment">投资</option>
                      <option value="investor">投资者</option>
                      <option value="personal">个人</option>
                      <option value="company">公司</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4.5">
                  <div>
                    <label className="mb-2.5 block text-black dark:text-white">
                      开始时间 <span className="text-meta-1">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={eventForm.startDate}
                      onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                    />
                  </div>

                  <div>
                    <label className="mb-2.5 block text-black dark:text-white">结束时间</label>
                    <input
                      type="datetime-local"
                      value={eventForm.endDate}
                      onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                    />
                  </div>
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">地点</label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder="请输入地点"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">描述</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    rows={3}
                    placeholder="请输入描述"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="mb-2.5 block text-black dark:text-white">颜色</label>
                    <input
                      type="color"
                      value={eventForm.color}
                      onChange={(e) => setEventForm({ ...eventForm, color: e.target.value })}
                      className="w-full h-12 rounded border-[1.5px] border-stroke bg-transparent outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark"
                    />
                  </div>

                  <div>
                    <label className="flex items-center mt-8 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eventForm.isAllDay}
                        onChange={(e) => setEventForm({ ...eventForm, isAllDay: e.target.checked })}
                        className="mr-3 h-5 w-5"
                      />
                      <span className="text-black dark:text-white">全天事件</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                  >
                    {loading ? "处理中..." : editingEvent ? "更新" : "创建"}
                  </button>
                  {editingEvent && (
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="justify-center rounded bg-danger p-3 px-8 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                    >
                      删除
                    </button>
                  )}
                  <button
                    onClick={() => setShowEventModal(false)}
                    disabled={loading}
                    className="justify-center rounded border border-stroke p-3 px-8 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white disabled:opacity-50"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
