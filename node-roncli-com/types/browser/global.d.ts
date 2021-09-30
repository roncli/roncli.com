import Account from "../../public/js/account"
import AccountChangeAliasView from "../../public/views/account/changeAlias"
import AccountChangeEmailView from "../../public/views/account/changeEmail"
import AccountChangePasswordView from "../../public/views/account/changePassword"
import AccountView from "../../public/views/account"
import AddErrorView from "../../public/views/media/addError"
import AdminFiles from "../../public/js/adminFiles"
import AdminFilesView from "../../public/views/adminFiles"
import AdminFrontPage from "../../public/js/adminFrontPage"
import AdminFrontPageView from "../../public/views/adminFrontPage"
import AdminModeration from "../../public/js/adminModeration"
import AdminModerationView from "../../public/views/adminModeration"
import AdminPage from "../../public/js/adminPage"
import AdminPageView from "../../public/views/adminPage"
import AdminPages from "../../public/js/adminPages"
import AdminPagesView from "../../public/views/adminPages"
import AdminRedirects from "../../public/js/adminRedirects"
import AdminRedirectsView from "../../public/views/adminRedirects"
import AdminView from "../../public/views/admin"
import AdminYouTube from "../../public/js/adminYouTube"
import AdminYouTubeView from "../../public/views/adminYouTube"
import BlogView from "../../public/views/blog"
import ChangeEmail from "../../public/js/changeEmail"
import ChangeEmailView from "../../public/views/changeEmail"
import ChangePassword from "../../public/js/changePassword"
import ChangePasswordView from "../../public/views/changePassword"
import CommentView from "../../public/views/comment/comment"
import Comments from "../../public/js/common/comments"
import CommentsView from "../../public/views/comment/comments"
import DirectoryView from "../../public/views/directory"
import Encoding from "../../public/js/common/encoding"
import ErrorPanelView from "../../public/views/index/errorPanel"
import HomeView from "../../public/views/home"
import Index from "../../public/js/index"
import IndexView from "../../public/views/index"
import LoginView from "../../public/views/index/login"
import MediaView from "../../public/views/media/media"
import MethodNotAllowedView from "../../public/views/405"
import Modal from "../../public/js/common/modal"
import ModalView from "../../public/views/index/modal"
import NotFoundView from "../../public/views/404"
import Numbers from "../../public/js/common/numbers"
import PageView from "../../public/views/page"
import Playlist from "../../public/js/playlist"
import PlaylistView from "../../public/views/playlist"
import ServerErrorView from "../../public/views/500"
import SoundcloudView from "../../public/views/media/soundcloud"
import SPA from "../../public/js/spa"
import Template from "../../public/js/common/template"
import Time from "../../public/js/common/time"
import UnauthorizedView from "../../public/views/401"
import UserView from "../../public/views/index/user"
import YouTubeView from "../../public/views/media/youtube"

export {}

declare global {
    interface Window {
        Account: typeof Account
        AccountChangeAliasView: typeof AccountChangeAliasView
        AccountChangeEmailView: typeof AccountChangeEmailView
        AccountChangePasswordView: typeof AccountChangePasswordView
        AccountView: typeof AccountView
        AddErrorView: typeof AddErrorView
        AdminFiles: typeof AdminFiles
        AdminFilesView: typeof AdminFilesView
        AdminFrontPage: typeof AdminFrontPage
        AdminFrontPageView: typeof AdminFrontPageView
        AdminModeration: typeof AdminModeration
        AdminModerationView: typeof AdminModerationView
        AdminPage: typeof AdminPage
        AdminPageView: typeof AdminPageView
        AdminPages: typeof AdminPages
        AdminPagesView: typeof AdminPagesView
        AdminRedirects: typeof AdminRedirects
        AdminRedirectsView: typeof AdminRedirectsView
        AdminView: typeof AdminView
        AdminYouTube: typeof AdminYouTube
        AdminYouTubeView: typeof AdminYouTubeView
        BlogView: typeof BlogView
        ChangeEmail: typeof ChangeEmail
        ChangeEmailView: typeof ChangeEmailView
        ChangePassword: typeof ChangePassword
        ChangePasswordView: typeof ChangePasswordView
        CommentView: typeof CommentView
        Comments: typeof Comments
        CommentsView: typeof CommentsView
        DirectoryView: typeof DirectoryView
        Encoding: typeof Encoding
        ErrorPanelView: typeof ErrorPanelView
        HomeView: typeof HomeView
        Index: typeof Index
        IndexView: typeof IndexView
        LoginView: typeof LoginView
        MediaView: typeof MediaView
        MethodNotAllowedView: typeof MethodNotAllowedView
        Modal: typeof Modal
        ModalView: typeof ModalView
        monaco: any
        NotFoundView: typeof NotFoundView
        Numbers: typeof Numbers
        PageView: typeof PageView
        Playlist: typeof Playlist
        PlaylistView: typeof PlaylistView
        require: any
        SC: any
        ServerErrorView: typeof ServerErrorView
        SoundcloudView: typeof SoundcloudView
        SPA: typeof SPA
        Template: typeof Template
        Time: typeof Time
        UnauthorizedView: typeof UnauthorizedView
        UserView: typeof UserView
        YouTubeView: typeof YouTubeView
        YT: any
    }
}
