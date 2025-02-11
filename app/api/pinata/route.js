import { pinata } from "../../../utils/config";

export async function POST(request) {
    const group = await pinata.groups.create({
        name: "My New Group",
    });

    // upload image to ipfs
    const image = await pinata.upload.file(image);

    // add image to group
    await pinata.groups.addImage(group.id, image.IpfsHash);

    console.log("group", group);
    return new Response(JSON.stringify(group), { status: 200 });
}
