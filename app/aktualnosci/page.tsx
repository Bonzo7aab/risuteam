import React from "react";

const Aktualnosci = () => {
  return (
    <div>
      {/* Card Grid */}
      <div className="grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:gap-12">
        {/* Card */}
        <a className="flex flex-col group focus:outline-hidden" href="#">
          <div className="overflow-hidden bg-gray-100 aspect-w-16 aspect-h-12 rounded-2xl">
            <img
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 group-focus:scale-105 rounded-2xl"
              src="https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Blog Image"
            />
          </div>

          <div className="pt-4">
            <h3 className="relative inline-block font-medium text-lg text-black before:absolute before:bottom-0.5 before:start-0 before:-z-1 before:w-full before:h-1 before:bg-lime-400 before:transition before:origin-left before:scale-x-0 group-hover:before:scale-x-100">
              eYoga
            </h3>
            <p className="mt-1 text-gray-600">
              A revamped and dynamic approach to yoga analytics
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="py-1.5 px-3 bg-white text-gray-600 border border-gray-200 text-xs sm:text-sm rounded-xl">
                Discovery
              </span>
              <span className="py-1.5 px-3 bg-white text-gray-600 border border-gray-200 text-xs sm:text-sm rounded-xl">
                Brand Guidelines
              </span>
              <span className="py-1.5 px-3 bg-white text-gray-600 border border-gray-200 text-xs sm:text-sm rounded-xl">
                Yoga
              </span>
            </div>
          </div>
        </a>
        {/* End Card */}

        {/* Card */}
        <a className="flex flex-col group focus:outline-hidden" href="#">
          <div className="overflow-hidden bg-gray-100 aspect-w-16 aspect-h-12 rounded-2xl">
            <img
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 group-focus:scale-105 rounded-2xl"
              src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Blog Image"
            />
          </div>

          <div className="pt-4">
            <h3 className="relative inline-block font-medium text-lg text-black before:absolute before:bottom-0.5 before:start-0 before:-z-1 before:w-full before:h-1 before:bg-lime-400 before:transition before:origin-left before:scale-x-0 group-hover:before:scale-x-100">
              Nike React
            </h3>
            <p className="mt-1 text-gray-600">
              Rewriting sport's playbook for billions of athletes
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="py-1.5 px-3 bg-white text-gray-600 border border-gray-200 text-xs sm:text-sm rounded-xl">
                Brand Strategy
              </span>
              <span className="py-1.5 px-3 bg-white text-gray-600 border border-gray-200 text-xs sm:text-sm rounded-xl">
                Visual Identity
              </span>
            </div>
          </div>
        </a>
        {/* End Card */}

        {/* Card */}
        <a className="flex flex-col group focus:outline-hidden" href="#">
          <div className="overflow-hidden bg-gray-100 aspect-w-16 aspect-h-12 rounded-2xl">
            <img
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 group-focus:scale-105 rounded-2xl"
              src="https://images.unsplash.com/photo-1649999920973-ab6bfd0c0017?q=80&w=560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Blog Image"
            />
          </div>

          <div className="pt-4">
            <h3 className="relative inline-block font-medium text-lg text-black before:absolute before:bottom-0.5 before:start-0 before:-z-1 before:w-full before:h-1 before:bg-lime-400 before:transition before:origin-left before:scale-x-0 group-hover:before:scale-x-100">
              Day Spa
            </h3>
            <p className="mt-1 text-gray-600">Designing a new cocktail can</p>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="py-1.5 px-3 bg-white text-gray-600 border border-gray-200 text-xs sm:text-sm rounded-xl">
                Brand Strategy
              </span>
              <span className="py-1.5 px-3 bg-white text-gray-600 border border-gray-200 text-xs sm:text-sm rounded-xl">
                Visual Identity
              </span>
            </div>
          </div>
        </a>
        {/* End Card */}

        {/* Card */}
        <a className="flex flex-col group focus:outline-hidden" href="#">
          <div className="overflow-hidden bg-gray-100 aspect-w-16 aspect-h-12 rounded-2xl">
            <img
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 group-focus:scale-105 rounded-2xl"
              src="https://images.unsplash.com/photo-1528291954423-c0c71c12baeb?q=80&w=560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Blog Image"
            />
          </div>

          <div className="pt-4">
            <h3 className="relative inline-block font-medium text-lg text-black before:absolute before:bottom-0.5 before:start-0 before:-z-1 before:w-full before:h-1 before:bg-lime-400 before:transition before:origin-left before:scale-x-0 group-hover:before:scale-x-100">
              Diamond Dynamics
            </h3>
            <p className="mt-1 text-gray-600">
              From cutting-edge equipment to stylish apparel
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="py-1.5 px-3 bg-white text-gray-600 border border-gray-200 text-xs sm:text-sm rounded-xl">
                Sports Gear
              </span>
              <span className="py-1.5 px-3 bg-white text-gray-600 border border-gray-200 text-xs sm:text-sm rounded-xl">
                Equipment
              </span>
              <span className="py-1.5 px-3 bg-white text-gray-600 border border-gray-200 text-xs sm:text-sm rounded-xl">
                Discovery
              </span>
            </div>
          </div>
        </a>
        {/* End Card */}
      </div>
      {/* End Card Grid */}
    </div>
  );
};

export default Aktualnosci;
