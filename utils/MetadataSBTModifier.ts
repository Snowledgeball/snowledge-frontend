
interface MetadataSBTModifierProps {
    fullName?: string,
    userName?: string,
    email?: string,
    accountAddress?: string
    image?: string,
    community?: {
        name: string,
        role: string
    }[]
}

export default async function MetadataSBTModifier(props: MetadataSBTModifierProps) {

    // TODO: Les valeurs a modifier / ajouter
    // const newValue = {
    //     community:
    //         [
    //             { "name": "the-bossssssss", "role": "admineeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" },
    //             { "name": "the-boss-oui-enft", "role": "admineeeeeeee" },
    //             { "name": "the-boss-oui-enft-2", "role": "admineeeeeeee" },
    //         ]
    // }

    const formData = new FormData();
    console.log("newValue :", props);
    formData.append("newValue", JSON.stringify(props));
    console.log("formData :", formData);


    const res = await fetch("/api/auth/upload", {
        method: "PUT",
        body: formData,
    });
    const data = await res.json();
    console.log(data);


    // return (
    //     <div
    //         style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    //     >
    //         { /* Formulaire pour modier les metadata de l'utilisateur dans le SBT */}
    //         <div className="flex justify-center items-center h-screen">
    //             <form onSubmit={handleSubmitUpdate}>
    //                 <label htmlFor="Nouvelle valeur">Nouvelle valeur</label>
    //                 <input type="text" name="newValue" />
    //                 <button type="submit">Modifier les metadata</button>
    //             </form>
    //         </div>
    //     </div>

    // );
}
