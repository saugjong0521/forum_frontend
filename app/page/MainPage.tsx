import EditorPage from "./EditorPage"
import SignInPage from "./modal/SignInPage"
import SignUpPage from "./modal/SignUpPage"


const MainPage = () => {

    return (
        <div className="w-screen h-screen flex justify-center items-center bg-[#222222]">
            <div className="max-w-[1400px] w-full h-full bg-[#bbb] flex">
                <SignInPage />
                <SignUpPage />
                <EditorPage />
            </div>
        </div>
    )

}

export default MainPage