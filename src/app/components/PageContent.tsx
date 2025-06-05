export default function PageContent() {
  return (
    <div className="p-8 h-full">
      <div className="space-y-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button className="py-3 px-5 text-blue-600 border-b-2 border-blue-600 font-medium focus:outline-none transition-colors duration-200">
            السلات المتروكة
          </button>
          <button className="py-3 px-5 text-gray-500 hover:text-gray-800 focus:outline-none transition-colors duration-200">
            قوالب الواتساب
          </button>
        </div>

        {/* Abandoned Carts Section */}
        <div className="space-y-8">
          {/* Section Title and Toggle */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">السلات المتروكة</h3>
            {/* Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed">
            استرداد المبيعات المفقودة من خلال اتخاذ إجراءات ومتابعة العملاء الذين يتركون سلات التسوق قبل اكمال عملية الشراء. سنقوم بتضمين
            رابط السلة تلقائيا في الرسالة.
          </p>

          {/* Message Template Section 1 */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h4 className="text-md font-medium text-gray-800">الرسالة</h4>
            </div>
            <p className="text-sm text-gray-500">
              سيتم إرسال هذه الرسالة فورا للعملاء الذين قاموا بترك السلات
            </p>
            {/* Template Selector */}
            <div className="relative">
              <select
                className="appearance-none w-full border border-gray-200 rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:border-blue-500 bg-white shadow-sm"
              >
                <option>اختر القالب</option>
                <option>قالب تذكير بالسلة المتروكة</option>
                <option>قالب عرض خصم</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Message Template Section 2 (Reminder) */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-md font-medium text-gray-800">الرسالة (تذكير ثاني)</h4>
              </div>
              {/* Toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            <p className="text-sm text-gray-500">
              سيتم إرسال هذه الرسالة بعد يوم كتذكير آخر للعملاء في حال عدم استكمال عملية الشراء
            </p>
            {/* Template Selector */}
            <div className="relative">
              <select
                className="appearance-none w-full border border-gray-200 rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:border-blue-500 bg-white shadow-sm"
              >
                <option>اختر القالب</option>
                <option>قالب تذكير ثاني</option>
                <option>قالب عرض خاص</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}