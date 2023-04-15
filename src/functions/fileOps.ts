import { dialog } from "@tauri-apps/api";
import { loadFromDisk, saveToDisk } from "../rust-invoke";


async function saveToFile(filename: string, data: any): Promise<string> {
  await saveToDisk(filename, data);
  return filename;

}

export async function save(filename: string | null, data: any): Promise<string> {
  if (filename) {
    return saveToFile(filename, data);
  }
  else {
    return saveAs(data);
  }
}

export async function saveAs(data: any): Promise<string> {
  const options: dialog.SaveDialogOptions = {
    title: 'Save File',
    defaultPath: './',
    filters: [
      {
        name: 'Json files',
        extensions: ['json'],
      },
    ],
  };
  const filenameResult = await dialog.save(options);

  if (filenameResult) {
    // The user selected a file to save.
    return await saveToFile(filenameResult, data);
  } else {
    throw "User canceled save dialog";
  }
}

export async function load(): Promise<[string, any]> {
  const options: dialog.OpenDialogOptions = {
    title: 'Open File',
    defaultPath: './',
    filters: [
      {
        name: 'Json files',
        extensions: ['json'],
      },
    ],
    multiple: false
  };

  const filenameResult = await dialog.open(options);
  if (filenameResult) {
    // The user selected a file to save.
    const data = await loadFromDisk(filenameResult as string);
    return [filenameResult as string, data];
  } else {
    throw "User canceled open dialog";
  }
}
