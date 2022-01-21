import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {
	AppBar,
	Box,
	Button, Dialog,
	DialogTitle,
	Divider,
	Grid, Link,
	ListItem,
	Menu,
	MenuItem,
	Tab,
	Tabs,
	Typography
} from "@material-ui/core";
import {ClowderInput} from "./styledComponents/ClowderInput";
import {ClowderButton} from "./styledComponents/ClowderButton";
import DescriptionIcon from "@material-ui/icons/Description";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
// import {UploadFile} from "./childComponents/UploadFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import CloudDownloadOutlinedIcon from "@material-ui/icons/CloudDownloadOutlined";
import {downloadDataset} from "../utils/dataset";
import {downloadFile, fetchFileMetadata} from "../utils/file";
import {FileMetadataList, RootState, Thumbnail} from "../types/data";
import {useHistory, useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {downloadThumbnail} from "../utils/thumbnail";
import {datasetDeleted, fetchDatasetAbout, fetchFilesInDataset} from "../actions/dataset";
import {fileDeleted} from "../actions/file";

import {TabPanel} from "./childComponents/TabComponent";
import {a11yProps} from "./childComponents/TabComponent";
import TopBar from "./childComponents/TopBar";
import {Breadcrumbs} from "./childComponents/BreadCrumb";
import {UploadFile} from "./childComponents/UploadFile";
import {V2} from "../openapi";
import {FileCard} from "./childComponents/FileCard";

const useStyles = makeStyles(() => ({
	appBar: {
		background: "#FFFFFF",
		boxShadow: "none",
	},
	tab: {
		fontStyle: "normal",
		fontWeight: "normal",
		fontSize: "16px",
		color: "#495057",
		textTransform: "capitalize",
		maxWidth: "50px",
	},
	fileCardOuterBox:{
		position:"relative"
	},
	fileCard: {
		background: "#FFFFFF",
		border: "1px solid #DFDFDF",
		boxSizing: "border-box",
		borderRadius: "4px",
		margin: "20px auto",
		"& > .MuiGrid-item": {
			padding: 0,
			height: "150px",
		}
	},
	fileCardImg: {
		height: "50%",
		margin: "40px auto",
		display: "block"
	},
	fileCardText:{
		padding: "40px 20px",
		fontSize:"16px",
		fontWeight:"normal",
		color:"#212529"
	},
	fileCardActionBox:{
		position:"absolute",
		right:"5%",
		top: "40px",
	},
	fileCardActionItem:{
		display:"block"
	},
	optionButton:{
		padding: "6px 12px",
		width: "100px",
		background: "#6C757D",
		borderRadius: "4px",
		color: "white",
		textTransform: "capitalize",
		'&:hover': {
			color: "black"
		},
	},
	optionMenuItem:{
		fontWeight: "normal",
		fontSize: "14px",
		color: "#212529",
		marginTop:"8px",
	}
}));


export const Dataset = (): JSX.Element => {
	const classes = useStyles();

	// path parameter
	const { datasetId } = useParams<{datasetId?: string}>();

	// use history hook to redirect/navigate between routes
	const history = useHistory();

	// Redux connect equivalent
	const dispatch = useDispatch();
	const deleteDataset = (datasetId:string|undefined) => dispatch(datasetDeleted(datasetId));
	const listFilesInDataset = (datasetId:string|undefined) => dispatch(fetchFilesInDataset(datasetId));
	const listDatasetAbout= (datasetId:string|undefined) => dispatch(fetchDatasetAbout(datasetId));

	// mapStateToProps
	const filesInDataset = useSelector((state:RootState) => state.dataset.files);
	const about = useSelector((state:RootState) => state.dataset.about);

	// state
	const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
	const [open, setOpen] = React.useState<boolean>(false);
	const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
	const [fileThumbnailList, setFileThumbnailList] = useState<any>([]);
	// const [fileMetadataList, setFileMetadataList] = useState<FileMetadataList[]>([]);

	const [editingName, setEditingName] = React.useState<boolean>(false);
	const [, setNewDatasetName] = React.useState<string>("");

	// component did mount list all files in dataset
	useEffect(() => {
		listFilesInDataset(datasetId);
		listDatasetAbout(datasetId);
	}, []);

	// TODO these code will go away in v2 dont worry about understanding them
	// TODO get metadata of each files; because we need the thumbnail of each file!!!
	useEffect(() => {

		(async () => {
			if (filesInDataset !== undefined && filesInDataset.length > 0) {

				// TODO any types fix later
				const fileMetadataListTemp:FileMetadataList[] = [];
				const fileThumbnailListTemp:any = [];
				await Promise.all(filesInDataset.map(async (fileInDataset) => {

					const fileMetadata = await fetchFileMetadata(fileInDataset["id"]);
					fileMetadataListTemp.push({"id": fileInDataset["id"], "metadata": fileMetadata});

					// add thumbnails
					if (fileMetadata["thumbnail"] !== null && fileMetadata["thumbnail"] !== undefined) {
						const thumbnailURL = await downloadThumbnail(fileMetadata["thumbnail"]);
						fileThumbnailListTemp.push({"id": fileInDataset["id"], "thumbnail": thumbnailURL});
					}
				}));

				// setFileMetadataList(fileMetadataListTemp);
				setFileThumbnailList(fileThumbnailListTemp);
			}
		})();
	}, [filesInDataset]);

	const handleTabChange = (_event:React.ChangeEvent<{}>, newTabIndex:number) => {
		setSelectedTabIndex(newTabIndex);
	};

	const handleOptionClick = (event: React.MouseEvent<any>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleOptionClose = () => {
		setAnchorEl(null);
	};

	// for breadcrumb
	const paths = [
		{
			"name": "Explore",
			"url": "/",
		},
		{
			"name":about["name"],
			"url":`/datasets/${datasetId}`
		}
	];

	return (
		<div>
			<TopBar/>
			<div className="outer-container">
				<Breadcrumbs paths={paths}/>
				<div className="inner-container">
					<Grid container spacing={4}>
						<Grid item xs={8}>
							<AppBar className={classes.appBar} position="static">
								{/*Tabs*/}
								<Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="dataset tabs">
									<Tab className={classes.tab} label="Files" {...a11yProps(0)} />
									<Tab className={classes.tab} label="Metadata" {...a11yProps(1)} disabled={true}/>
									<Tab className={classes.tab} label="Extractions" {...a11yProps(2)} disabled={true}/>
									<Tab className={classes.tab} label="Visualizations" {...a11yProps(3)} disabled={true}/>
									<Tab className={classes.tab} label="Comments" {...a11yProps(4)} disabled={true}/>
								</Tabs>
							</AppBar>
							<TabPanel value={selectedTabIndex} index={0}>
								<Grid container spacing={2}>
								{
									filesInDataset.map((file) =>
										<Grid item xs={12}>
											<FileCard file={file} datasetId={datasetId}/>
										</Grid>
									)
								}
								</Grid>
							</TabPanel>
							<TabPanel value={selectedTabIndex} index={1} />
							<TabPanel value={selectedTabIndex} index={2} />
							<TabPanel value={selectedTabIndex} index={3} />
							<TabPanel value={selectedTabIndex} index={4} />
						</Grid>
						<Grid item xs={4}>
							{/*option menus*/}
							<Box className="infoCard">
								<Button aria-haspopup="true" onClick={handleOptionClick}
										className={classes.optionButton} endIcon={<ArrowDropDownIcon />}>
									Options
								</Button>
								<Menu
									id="simple-menu"
									anchorEl={anchorEl}
									keepMounted
									open={Boolean(anchorEl)}
									onClose={handleOptionClose}
								>
									<MenuItem className={classes.optionMenuItem}
											  onClick={()=>{
												  setOpen(true);
												  handleOptionClose();
											  }}>
										Add Files
									</MenuItem>
									<MenuItem className={classes.optionMenuItem}
											  onClick={() => {
												  downloadDataset(datasetId, about["name"]);
												  handleOptionClose();
											  }} disabled={true}>
										Download All
									</MenuItem>
									<MenuItem onClick={()=>{
										deleteDataset(datasetId);
										handleOptionClose();
										// Go to Explore page
										history.push("/");
									}
									} className={classes.optionMenuItem}>Delete Dataset</MenuItem>
									<MenuItem onClick={handleOptionClose} className={classes.optionMenuItem} disabled={true}>Follow</MenuItem>
									<MenuItem onClick={handleOptionClose} className={classes.optionMenuItem} disabled={true}>Collaborators</MenuItem>
									<MenuItem onClick={handleOptionClose} className={classes.optionMenuItem} disabled={true}>Extraction</MenuItem>
								</Menu>
							</Box>
							<Divider />
							{
								about !== undefined ?
									<Box className="infoCard">
										<Typography className="title">About</Typography>
										{
											editingName ? <>:
												<ClowderInput required={true} onChange={(event) => {
													const { value } = event.target;
													setNewDatasetName(value);
												}} defaultValue={about["name"]}/>
												<Button onClick={() => {
													V2.DatasetsService.editDatasetApiV2DatasetsDatasetIdPut(about["id"]).then((json: any) => {
														// TODO: Dispatch response back to Redux
														console.log("PUT Dataset Response:", json);
														setEditingName(false);
													});
												}} disabled={true}>Save</Button>
												<Button onClick={() => setEditingName(false)}>Cancel</Button>
											</> :
												<Typography className="content">Name: {about["name"]}
													<Button onClick={() => setEditingName(true)} size={"small"}>Edit</Button>
												</Typography>
										}
										<Typography className="content">Dataset ID: {about["id"]}</Typography>
										<Typography className="content">Owner: {about["authorId"]}</Typography>
										<Typography className="content">Description: {about["description"]}</Typography>
										<Typography className="content">Created on: {about["created"]}</Typography>
										{/*/!*TODO use this to get thumbnail*!/*/}
										<Typography className="content">Thumbnail: {about["thumbnail"]}</Typography>
										{/*<Typography className="content">Belongs to spaces: {about["authorId"]}</Typography>*/}
										{/*/!*TODO not sure how to use this info*!/*/}
										{/*<Typography className="content">Resource type: {about["resource_type"]}</Typography>*/}
									</Box> : <></>
							}
							<Divider />
							<Box className="infoCard">
								<Typography className="title">Statistics</Typography>
								<Typography className="content">Views: 10</Typography>
								<Typography className="content">Last viewed: Jun 07, 2021 21:49:09</Typography>
								<Typography className="content">Downloads: 0</Typography>
								<Typography className="content">Last downloaded: Never</Typography>
							</Box>
							<Divider />
							<Box className="infoCard">
								<Typography className="title">Tags</Typography>
								<Grid container spacing={4}>
									<Grid item lg={8} sm={8} xl={8} xs={12}>
										<ClowderInput defaultValue="Tag"/>
									</Grid>
									<Grid item lg={4} sm={4} xl={4} xs={12}>
										<ClowderButton disabled={true}>Search</ClowderButton>
									</Grid>
								</Grid>
							</Box>
							<Divider light/>
						</Grid>
					</Grid>
					<Dialog open={open} onClose={()=>{setOpen(false);}} fullWidth={true} aria-labelledby="form-dialog">
						<DialogTitle id="form-dialog-title">Add File</DialogTitle>
						{/*TODO: pass select to uploader so once upload succeeded, can jump to that dataset/file page*/}
						<UploadFile selectedDatasetId={datasetId} setOpen={setOpen}/>
					</Dialog>
				</div>
			</div>
		</div>
	);
};
