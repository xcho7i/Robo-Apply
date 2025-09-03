import GradientButton from "@/src/components/GradientButton"
import { getExtensionVersion } from "@/src/extension"
import { Modal } from "antd"

interface Props {
  show: boolean
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  action: (type: "continue" | "upgrade") => void
}

function ExtensionUpgradeModal({ setShow, show, action }: Props) {
  return (
    <Modal
      destroyOnHidden
      centered
      classNames={{
        header: "!bg-modalPurple",
        content: "!bg-modalPurple !border !border-white"
      }}
      open={show}
      onCancel={() => setShow(false)}
      className=""
      title={
        <p className=" text-2xl mb-4 text-center font-extrabold pb-1 border-b border-purple/40">
          Upgrade Extension
        </p>
      }
      footer={
        <div className="flex justify-end items-center">
          <GradientButton onClick={() => action("upgrade")}>
            Upgrade
          </GradientButton>
        </div>
      }
      onOk={() => action("upgrade")}>
      <p className="text-base text-center my-5 font-semibold ">
        You are using an older version of RoboApply extension. Please click
        "Upgrade" to get latest features.
      </p>
      <div className=" flex flex-col  items-center my-5 font-semibold text-gray-400">
        <div className="">
          <p className="flex items-center justify-between gap-2">
            Installed Version:{" "}
            <span className="text-base ">
              {getExtensionVersion().installed}
            </span>
          </p>
          <p className="flex items-center justify-between">
            Latest Version:{" "}
            <span className="text-base ">{getExtensionVersion().latest}</span>
          </p>
        </div>
      </div>
    </Modal>
  )
}
export default ExtensionUpgradeModal
