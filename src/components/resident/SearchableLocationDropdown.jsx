import React from "react";
import Select from "react-select";

// Grouped location options per facility
const locationOptions = [
  {
    label: "Soccer Field",
    options: [
      { value: "Soccer Field", label: "Soccer Field" },
      { value: "Soccer Field Restroom", label: "Soccer Field Restroom" },
      { value: "Soccer Field Changing Room", label: "Soccer Field Changing Room" },
      { value: "Soccer Field Locker Room", label: "Soccer Field Locker Room" }
    ]
  },
  {
    label: "Pool",
    options: [
      { value: "Pool", label: "Pool" },
      { value: "Pool Restroom", label: "Pool Restroom" },
      { value: "Pool Changing Room", label: "Pool Changing Room" },
      { value: "Pool Locker Room", label: "Pool Locker Room" },
      { value: "Pool Lifeguard Station", label: "Pool Lifeguard Station" }
    ]
  },
  {
    label: "Gym",
    options: [
      { value: "Gym", label: "Gym" },
      { value: "Gym Restroom", label: "Gym Restroom" },
      { value: "Gym Changing Room", label: "Gym Changing Room" },
      { value: "Gym Locker Room", label: "Gym Locker Room" }
    ]
  },
  {
    label: "Garden",
    options: [
      { value: "Garden", label: "Garden" },
      { value: "Garden Area", label: "Garden Area" },

    ]
  },
  {
    label: "Basketball Court",
    options: [
      { value: "Basketball Court", label: "Basketball Court" },
      { value: "Basketball Court Restroom", label: "Basketball Court Restroom" },
      { value: "Basketball Court Changing Room", label: "Basketball Court Changing Room" },
      { value: "Basketball Court Locker Room", label: "Basketball Court Locker Room" }
    ]
  }
];

const SearchableLocationDropdown = ({ value, onChange }) => {
  const selectedOption = locationOptions
    .flatMap(group => group.options)
    .find(opt => opt.value === value);

  return (
    <main className="location-dropdown">
      <label htmlFor="location-select" className="dropdown-label">Select Location</label>
      <Select
        id="location-select"
        options={locationOptions}
        value={selectedOption}
        onChange={(selected) => onChange(selected?.value || "")}
        placeholder="Search or choose location..."
        isSearchable
      />
    </main>
  );
};

export default SearchableLocationDropdown;
