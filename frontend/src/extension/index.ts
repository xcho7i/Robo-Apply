import { ExtResp } from "@types"
import { ExternalMessage } from "@types"

export let extensionID = "omhfaemlhfikakkigibnfjcpaibpenha"
export const latestExtensionVersion = "1.3.0"
let installedExtensionVersion = ""

export const extensionURL =
  "https://chromewebstore.google.com/detail/roboapply/omhfaemlhfikakkigibnfjcpaibpenha?hl=en"

export async function getResponseFromExtension<T extends ExternalMessage>(
  params: T
): Promise<ExtResp<T["type"]>> {
  const response = await chrome?.runtime?.sendMessage<ExternalMessage>(
    extensionID,
    {
      ...params
    }
  )

  return response
}

/**
 *  Helper function to check if extension is installed
 */
export async function isExtensionInstalled(): Promise<{
  installed: boolean
  isOutdated: boolean
  version: string
}> {
  try {
    const res = await chrome?.runtime?.sendMessage<
      ExternalMessage,
      ExtResp<"isExtensionInstalled">
    >(extensionID, {
      type: "isExtensionInstalled"
    })
    return { ...res, isOutdated: isUsingOutdatedVersion(res?.version) }
  } catch (error) {
    return { installed: false, version: "", isOutdated: false }
  }
}

/**
 * Helper function to check if user using an older version
 * @param {string} versionUsing - Installed version on user device
 */
export function isUsingOutdatedVersion(versionUsing: string) {
  installedExtensionVersion = versionUsing
  if (
    Number(versionUsing?.replaceAll(".", "")) <
    Number(latestExtensionVersion.replaceAll(".", ""))
  ) {
    return true
  }

  return false
}

export function getExtensionVersion() {
  return {
    installed: installedExtensionVersion,
    latest: latestExtensionVersion
  }
}

export async function activateTab() {
  const res = await chrome?.runtime
    ?.sendMessage<ExternalMessage, ExtResp<"activateTab">>(extensionID, {
      type: "activateTab"
    })
    .catch((err) => console.log({ err }))
}
