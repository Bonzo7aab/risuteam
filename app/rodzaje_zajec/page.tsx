import React from "react";

const RodzajeZajec = () => {
  return (
    <div>
      {/* Features */}
      <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        {/* Tab Nav */}
        <nav
          className="flex flex-col max-w-6xl mx-auto sm:flex-row gap-y-px sm:gap-y-0 sm:gap-x-4"
          aria-label="Tabs"
          role="tablist"
          aria-orientation="horizontal"
        >
          <button
            type="button"
            className="flex flex-col w-full p-3 hs-tab-active:bg-gray-100 hs-tab-active:hover:border-transparent text-start hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 md:p-5 rounded-xl active"
            id="tabs-with-card-item-1"
            aria-selected="true"
            data-hs-tab="#tabs-with-card-1"
            aria-controls="tabs-with-card-1"
            role="tab"
          >
            <svg
              className="hidden text-gray-800 shrink-0 sm:block size-7 hs-tab-active:text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
              <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
              <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
              <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
              <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
            </svg>
            <span className="sm:mt-5">
              <span className="block font-semibold text-gray-800 hs-tab-active:text-blue-600">
                All-in-one workspace
              </span>
              <span className="hidden mt-2 text-gray-800 lg:block">
                Create a business, whether you’ve got a fresh idea.
              </span>
            </span>
          </button>

          <button
            type="button"
            className="flex flex-col w-full p-3 hs-tab-active:bg-gray-100 hs-tab-active:hover:border-transparent text-start hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 md:p-5 rounded-xl"
            id="tabs-with-card-item-2"
            aria-selected="false"
            data-hs-tab="#tabs-with-card-2"
            aria-controls="tabs-with-card-2"
            role="tab"
          >
            <svg
              className="hidden text-gray-800 shrink-0 sm:block size-7 hs-tab-active:text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 14 4-4" />
              <path d="M3.34 19a10 10 0 1 1 17.32 0" />
            </svg>
            <span className="sm:mt-5">
              <span className="block font-semibold text-gray-800 hs-tab-active:text-blue-600">
                Automation on a whole new level
              </span>
              <span className="hidden mt-2 text-gray-800 lg:block">
                Use automation to scale campaigns profitably and save time doing
                it.
              </span>
            </span>
          </button>

          <button
            type="button"
            className="flex flex-col w-full p-3 hs-tab-active:bg-gray-100 hs-tab-active:hover:border-transparent text-start hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 md:p-5 rounded-xl"
            id="tabs-with-card-item-3"
            aria-selected="false"
            data-hs-tab="#tabs-with-card-3"
            aria-controls="tabs-with-card-3"
            role="tab"
          >
            <svg
              className="hidden text-gray-800 shrink-0 sm:block size-7 hs-tab-active:text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              <path d="M5 3v4" />
              <path d="M19 17v4" />
              <path d="M3 5h4" />
              <path d="M17 19h4" />
            </svg>
            <span className="sm:mt-5">
              <span className="block font-semibold text-gray-800 hs-tab-active:text-blue-600">
                Solving problems for every team
              </span>
              <span className="hidden mt-2 text-gray-800 lg:block">
                One tool for your company to share knowledge and ship projects.
              </span>
            </span>
          </button>
        </nav>
        {/* End Tab Nav */}

        {/* Tab Content */}
        <div className="mt-12 md:mt-16">
          <div
            id="tabs-with-card-1"
            role="tabpanel"
            aria-labelledby="tabs-with-card-item-1"
          >
            {/* Devices */}
            <div className="max-w-[1140px] lg:pb-32 relative">
              {/* Mobile Device */}
              <figure className="absolute bottom-0 hidden h-auto max-w-full mb-20 start-0 z-2 w-60 ms-20 lg:block">
                <div className="p-1.5 bg-gray-100 rounded-3xl shadow-[0_2.75rem_5.5rem_-3.5rem_rgb(45_55_75_/_20%),_0_2rem_4rem_-2rem_rgb(45_55_75_/_30%),_inset_0_-0.1875rem_0.3125rem_0_rgb(45_55_75_/_20%)]">
                  <img
                    className="max-w-full rounded-[1.25rem] h-auto"
                    src="../assets/img/mockups/img9.jpg"
                    alt="Features Image"
                  />
                </div>
              </figure>
              {/* End Mobile Device */}

              {/* Browser Device */}
              <figure className="ms-auto me-20 relative z-1 max-w-full w-3xl h-auto shadow-[0_2.75rem_3.5rem_-2rem_rgb(45_55_75_/_20%),_0_0_5rem_-2rem_rgb(45_55_75_/_15%)] rounded-b-lg">
                <div className="relative flex items-center max-w-3xl px-24 py-2 bg-white border-b border-gray-100 rounded-t-lg">
                  <div className="absolute flex -translate-y-1 gap-x-1 top-2/4 start-4">
                    <span className="bg-gray-200 rounded-full size-2"></span>
                    <span className="bg-gray-200 rounded-full size-2"></span>
                    <span className="bg-gray-200 rounded-full size-2"></span>
                  </div>
                  <div className="flex justify-center items-center size-full bg-gray-200 text-[.25rem] text-gray-800 rounded-sm sm:text-[.5rem]">
                    www.preline.co
                  </div>
                </div>

                <div className="bg-gray-800 rounded-b-lg">
                  <img
                    className="h-auto max-w-full rounded-b-lg"
                    src="../assets/img/mockups/img8.jpg"
                    alt="Features Image"
                  />
                </div>
              </figure>
              {/* End Browser Device */}
            </div>
            {/* End Devices */}
          </div>

          <div
            id="tabs-with-card-2"
            className="hidden"
            role="tabpanel"
            aria-labelledby="tabs-with-card-item-2"
          >
            {/* Devices */}
            <div className="max-w-[1140px] lg:pb-32 relative">
              {/* Mobile Device */}
              <figure className="absolute bottom-0 hidden h-auto max-w-full mb-20 start-0 z-2 w-60 ms-20 lg:block">
                <div className="p-1.5 bg-gray-700 shadow-[0_2.75rem_5.5rem_-3.5rem_rgb(0_0_0_/_20%),_0_2rem_4rem_-2rem_rgb(0_0_0_/_30%),_inset_0_-0.1875rem_0.3125rem_0_rgb(0_0_0_/_20%)] rounded-3xl">
                  <img
                    className="max-w-full rounded-[1.25rem] h-auto"
                    src="../assets/img/mockups/img11.jpg"
                    alt="Features Image"
                  />
                </div>
              </figure>
              {/* End Mobile Device */}

              {/* Browser Device */}
              <figure className="ms-auto me-20 relative z-1 max-w-full w-3xl h-auto shadow-shadow-[0_2.75rem_3.5rem_-2rem_rgb(0_0_0_/_20%),_0_0_5rem_-2rem_rgb(0_0_0_/_15%)] rounded-b-lg">
                <div className="relative flex items-center max-w-3xl px-24 py-2 bg-gray-800 border-b border-gray-700 rounded-t-lg">
                  <div className="absolute flex -translate-y-1 gap-x-1 top-2/4 start-4">
                    <span className="bg-gray-700 rounded-full size-2"></span>
                    <span className="bg-gray-700 rounded-full size-2"></span>
                    <span className="bg-gray-700 rounded-full size-2"></span>
                  </div>
                  <div className="flex justify-center items-center size-full bg-gray-700 text-[.25rem] sm:text-[.5rem] text-gray-200 rounded-sm">
                    www.preline.co
                  </div>
                </div>

                <div className="bg-gray-800 rounded-b-lg">
                  <img
                    className="h-auto max-w-full rounded-b-lg"
                    src="../assets/img/mockups/img10.jpg"
                    alt="Features Image"
                  />
                </div>
              </figure>
              {/* End Browser Device */}
            </div>
            {/* End Devices */}
          </div>

          <div
            id="tabs-with-card-3"
            className="hidden"
            role="tabpanel"
            aria-labelledby="tabs-with-card-item-3"
          >
            {/* Devices */}
            <div className="max-w-[1140px] lg:pb-32 relative">
              {/* Mobile Device */}
              <figure className="absolute bottom-0 hidden h-auto max-w-full mb-20 start-0 z-2 w-60 ms-20 lg:block">
                <div className="p-1.5 bg-gray-100 rounded-3xl shadow-[0_2.75rem_5.5rem_-3.5rem_rgb(45_55_75_/_20%),_0_2rem_4rem_-2rem_rgb(45_55_75_/_30%),_inset_0_-0.1875rem_0.3125rem_0_rgb(45_55_75_/_20%)]">
                  <img
                    className="max-w-full rounded-[1.25rem] h-auto"
                    src="../assets/img/mockups/img13.jpg"
                    alt="Features Image"
                  />
                </div>
              </figure>
              {/* End Mobile Device */}

              {/* Browser Device */}
              <figure className="ms-auto me-20 relative z-1 max-w-full w-3xl h-auto shadow-[0_2.75rem_3.5rem_-2rem_rgb(45_55_75_/_20%),_0_0_5rem_-2rem_rgb(45_55_75_/_15%)] rounded-b-lg">
                <div className="relative flex items-center max-w-3xl px-24 py-2 bg-white border-b border-gray-100 rounded-t-lg">
                  <div className="absolute flex -translate-y-1 gap-x-1 top-2/4 start-4">
                    <span className="bg-gray-200 rounded-full size-2"></span>
                    <span className="bg-gray-200 rounded-full size-2"></span>
                    <span className="bg-gray-200 rounded-full size-2"></span>
                  </div>
                  <div className="flex justify-center items-center size-full bg-gray-200 text-[.25rem] text-gray-800 rounded-sm sm:text-[.5rem]">
                    www.preline.co
                  </div>
                </div>

                <div className="bg-gray-800 rounded-b-lg">
                  <img
                    className="h-auto max-w-full rounded-b-lg"
                    src="../assets/img/mockups/img12.jpg"
                    alt="Features Image"
                  />
                </div>
              </figure>
              {/* End Browser Device */}
            </div>
            {/* End Devices */}
          </div>
        </div>
        {/* End Tab Content */}
      </div>
      {/* End Features */}
    </div>
  );
};

export default RodzajeZajec;
