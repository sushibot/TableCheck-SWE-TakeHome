import { useState } from "react";
import classes from "./dropdown.module.css";
import { RxPerson, RxCaretDown } from "react-icons/rx";
export interface DropdownProps {
  options: number[];
  onChange: (option: number) => void;
}
export const Dropdown = ({ options, onChange }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number>(options[0]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: number) => {
    setSelectedOption(option);
    setIsOpen(false);
    onChange(option);
    return option;
  };

  return (
    <div className={classes.container}>
      <div className={classes.selectedOptionContainer} onClick={toggleDropdown}>
        <span className={classes.selectedOptionText}>
          <RxPerson color="#646cff" />
          {selectedOption > 1
            ? `${selectedOption} people`
            : `${selectedOption} person`}
        </span>
        <RxCaretDown color="#646cff" />
      </div>
      {isOpen && (
        <ul className={classes.list}>
          {options.map((option, index) => (
            <li
              className={classes.listItem}
              key={index}
              onClick={() => handleOptionClick(option)}
            >
              <RxPerson color="#646cff" />

              {option > 1 ? `${option} people` : `${option} person`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
