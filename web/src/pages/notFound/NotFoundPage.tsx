import Page from "../../components/Page";

const NotFoundPage = () => {
    return (
        <Page className="items-center justify-center" requiresAuth={false}>
            404 page not found :(
        </Page>
    );
};

export default NotFoundPage;
