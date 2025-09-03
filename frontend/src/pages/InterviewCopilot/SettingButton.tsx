import SettingIcon from "@/src/assets/Setting.svg"
import Button from "@/src/components/Button/index"

interface SettingButtonProps {
    onClickHandler?: () => void;
}

const SettingButton = ({onClickHandler} : SettingButtonProps) => {
  return (
    <Button
      className="py-3 flex items-center space-x-2 w-full justify-center text-md md:text-md whitespace-nowrap font-semibold rounded-lg bg-none text-primary border border-primary px-4"
      onClick={() => onClickHandler?.()}>
      <img src={SettingIcon} />
      <span> Setting </span>
    </Button>
  )
}

export default SettingButton
