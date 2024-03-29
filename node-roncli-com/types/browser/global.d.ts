import Account from "../../public/js/account"
import AccountChangeAliasView from "../../public/views/account/changeAlias"
import AccountChangeEmailView from "../../public/views/account/changeEmail"
import AccountChangePasswordView from "../../public/views/account/changePassword"
import AccountView from "../../public/views/account"
import AddErrorView from "../../public/views/media/addError"
import AdminCache from "../../public/js/adminCache"
import AdminCacheView from "../../public/views/adminCache"
import AdminContacts from "../../public/js/adminContacts"
import AdminContactsView from "../../public/views/adminContacts"
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
import AdminProject from "../../public/js/adminProject"
import AdminProjectView from "../../public/views/adminProject"
import AdminProjects from "../../public/js/adminProjects"
import AdminProjectsView from "../../public/views/adminProjects"
import AdminRedirects from "../../public/js/adminRedirects"
import AdminRedirectsView from "../../public/views/adminRedirects"
import AdminResume from "../../public/js/adminResume"
import AdminResumeView from "../../public/views/adminResume"
import AdminView from "../../public/views/admin"
import AdminYouTube from "../../public/js/adminYouTube"
import AdminYouTubeView from "../../public/views/adminYouTube"
import AlbumView from "../../public/views/index/album"
import Blog from "../../public/js/blog"
import BlogCategoryView from "../../public/views/blogCategory"
import BlogContentView from "../../public/views/blog/content"
import BlogPostView from "../../public/views/blogPost"
import BlogTitlesView from "../../public/views/blog/titles"
import BlogView from "../../public/views/blog"
import ChangeEmail from "../../public/js/changeEmail"
import ChangeEmailView from "../../public/views/changeEmail"
import ChangePassword from "../../public/js/changePassword"
import ChangePasswordView from "../../public/views/changePassword"
import CodingProjectView from "../../public/views/codingProject"
import CodingView from "../../public/views/coding"
import CommentView from "../../public/views/comment/comment"
import Comments from "../../public/js/common/comments"
import CommentsView from "../../public/views/comment/comments"
import DirectoryView from "../../public/views/directory"
import Encoding from "../../public/js/common/encoding"
import ErrorPanelView from "../../public/views/index/errorPanel"
import GamingNecroDancerView from "../../public/views/gamingNecroDancer"
import GamingSpeedrunsView from "../../public/views/gamingSpeedruns"
import GamingSteam from "../../public/js/gamingSteam"
import GamingSteamGamesView from "../../public/views/gamingSteam/games"
import GamingSteamView from "../../public/views/gamingSteam"
import GamingView from "../../public/views/gaming"
import HomeView from "../../public/views/home"
import Index from "../../public/js/index"
import IndexView from "../../public/views/index"
import LoginView from "../../public/views/index/login"
import MediaView from "../../public/views/media/media"
import MethodNotAllowedView from "../../public/views/405"
import MicroblogView from "../../public/views/home/microblog"
import Modal from "../../public/js/common/modal"
import ModalView from "../../public/views/index/modal"
import Music from "../../public/js/music"
import MusicCategoryView from "../../public/views/musicCategory"
import MusicTrackView from "../../public/views/musicTrack"
import MusicTracksView from "../../public/views/music/tracks"
import MusicView from "../../public/views/music"
import NotFoundView from "../../public/views/404"
import Numbers from "../../public/js/common/numbers"
import PageView from "../../public/views/page"
import PaginationPageView from "../../public/views/pagination/page"
import Playlist from "../../public/js/playlist"
import PlaylistView from "../../public/views/playlist"
import Resume from "../../public/js/resume"
import ResumeView from "../../public/views/resume"
import ServerErrorView from "../../public/views/500"
import SoundCloudView from "../../public/views/media/soundcloud"
import SpeedrunGameView from "../../public/views/speedrunGame"
import SteamGameView from "../../public/views/steamGame"
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
        AdminCache: typeof AdminCache
        AdminCacheView: typeof AdminCacheView
        AdminContacts: typeof AdminContacts
        AdminContactsView: typeof AdminContactsView
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
        AdminProject: typeof AdminProject
        AdminProjectView: typeof AdminProjectView
        AdminProjects: typeof AdminProjects
        AdminProjectsView: typeof AdminProjectsView
        AdminRedirects: typeof AdminRedirects
        AdminRedirectsView: typeof AdminRedirectsView
        AdminResume: typeof AdminResume
        AdminResumeView: typeof AdminResumeView
        AdminView: typeof AdminView
        AdminYouTube: typeof AdminYouTube
        AdminYouTubeView: typeof AdminYouTubeView
        AlbumView: typeof AlbumView
        Blog: typeof Blog
        BlogContentView: typeof BlogContentView
        BlogPostView: typeof BlogPostView
        BlogTitlesView: typeof BlogTitlesView
        BlogView: typeof BlogView
        BlogCategoryView: typeof BlogCategoryView
        ChangeEmail: typeof ChangeEmail
        ChangeEmailView: typeof ChangeEmailView
        ChangePassword: typeof ChangePassword
        ChangePasswordView: typeof ChangePasswordView
        CodingProjectView: typeof CodingProjectView
        CodingView: typeof CodingView
        CommentView: typeof CommentView
        Comments: typeof Comments
        CommentsView: typeof CommentsView
        DirectoryView: typeof DirectoryView
        Encoding: typeof Encoding
        ErrorPanelView: typeof ErrorPanelView
        GamingNecroDancerView: typeof GamingNecroDancerView
        GamingSpeedrunsView: typeof GamingSpeedrunsView
        GamingSteam: typeof GamingSteam
        GamingSteamGamesView: typeof GamingSteamGamesView
        GamingSteamView: typeof GamingSteamView
        GamingView: typeof GamingView
        HomeView: typeof HomeView
        Index: typeof Index
        IndexView: typeof IndexView
        LoginView: typeof LoginView
        MediaView: typeof MediaView
        MethodNotAllowedView: typeof MethodNotAllowedView
        MicroblogView: typeof MicroblogView
        Modal: typeof Modal
        ModalView: typeof ModalView
        monaco: any
        Music: typeof Music
        MusicCategoryView: typeof MusicCategoryView
        MusicTrackView: typeof MusicTrackView
        MusicTracksView: typeof MusicTracksView
        MusicView: typeof MusicView
        NotFoundView: typeof NotFoundView
        Numbers: typeof Numbers
        ol: any
        PageView: typeof PageView
        PaginationPageView: typeof PaginationPageView
        Playlist: typeof Playlist
        PlaylistView: typeof PlaylistView
        require: any
        Resume: typeof Resume
        ResumeView: typeof ResumeView
        SC: any
        ServerErrorView: typeof ServerErrorView
        SoundCloudView: typeof SoundCloudView
        SpeedrunGameView: typeof SpeedrunGameView
        SteamGameView: typeof SteamGameView
        SPA: typeof SPA
        Template: typeof Template
        Time: typeof Time
        UnauthorizedView: typeof UnauthorizedView
        UserView: typeof UserView
        YouTubeView: typeof YouTubeView
        YT: any
    }
}
