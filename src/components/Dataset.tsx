import React, {useEffect, useState} from "react";
import {
	AppBar,
	Box,
	Button, Dialog,
	DialogTitle,
	Divider,
	Grid,
	Menu,
	MenuItem,
	Tab,
	Tabs,
	Typography
} from "@mui/material";
import {ClowderInput} from "./styledComponents/ClowderInput";
import {ClowderButton} from "./styledComponents/ClowderButton";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {downloadDataset} from "../utils/dataset";
import {useNavigate, useParams} from "react-router-dom";
import {File, RootState} from "../types/data";
import {useDispatch, useSelector} from "react-redux";
import {datasetDeleted, fetchDatasetAbout, fetchFilesInDataset} from "../actions/dataset";
import {resetFailedReason} from "../actions/common"

import {TabPanel} from "./childComponents/TabComponent";
import {a11yProps} from "./childComponents/TabComponent";
import TopBar from "./childComponents/TopBar";
import {MainBreadcrumbs} from "./childComponents/BreadCrumb";
import {UploadFile} from "./childComponents/UploadFile";
import {V2} from "../openapi";
import {ActionModal} from "./childComponents/ActionModal";
import {FileCard} from "./childComponents/FileCard";

const tab = {
	fontStyle: "normal",
	fontWeight: "normal",
	fontSize: "16px",
	color: "#495057",
	textTransform: "capitalize",
};

const optionMenuItem = {
	fontWeight: "normal",
	fontSize: "14px",
	color: "#212529",
	marginTop:"8px",
}

export const Dataset = (): JSX.Element => {

	// path parameter
	const { datasetId } = useParams<{datasetId?: string}>();

	// use history hook to redirect/navigate between routes
	const history = useNavigate();

	// Redux connect equivalent
	const dispatch = useDispatch();
	const deleteDataset = (datasetId:string|undefined) => dispatch(datasetDeleted(datasetId));
	const listFilesInDataset = (datasetId:string|undefined) => dispatch(fetchFilesInDataset(datasetId));
	const listDatasetAbout= (datasetId:string|undefined) => dispatch(fetchDatasetAbout(datasetId));
	const dismissError = () => dispatch(resetFailedReason());

	// mapStateToProps
	const filesInDataset = useSelector((state:RootState) => state.dataset.files);
	const about = useSelector((state:RootState) => state.dataset.about);
	const reason = useSelector((state:RootState) => state.dataset.reason);

	// state
	const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
	const [open, setOpen] = React.useState<boolean>(false);
	const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
	const [selectedFile, setSelectedFile] = useState<File>();
	// const [fileMetadataList, setFileMetadataList] = useState<FileMetadataList[]>([]);

	const [editingName, setEditingName] = React.useState<boolean>(false);
	const [, setNewDatasetName] = React.useState<string>("");

	// confirmation dialog
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const deleteSelectedFile = () => {
		if (selectedFile) {
			deleteFile(selectedFile["id"]);
		}
		setConfirmationOpen(false);
	}

	// component did mount list all files in dataset
	useEffect(() => {
		listFilesInDataset(datasetId);
		listDatasetAbout(datasetId);
	}, []);

	// Error msg dialog
	const [errorOpen, setErrorOpen] = useState(false);
	useEffect(() => {
		if (reason !== "" && reason !== null && reason !== undefined){
			setErrorOpen(true);
		}
	}, [reason])
	const handleErrorCancel = () => {
		// reset error message and close the error window
		dismissError();
		setErrorOpen(false);
	}

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
				<MainBreadcrumbs paths={paths}/>
				{/*Confirmation dialogue*/}
				<ActionModal actionOpen={confirmationOpen} actionTitle="Are you sure?"
							 actionText="Do you really want to delete? This process cannot be undone."
							 actionBtnName="Delete" handleActionBtnClick={deleteSelectedFile}
							 handleActionCancel={() => { setConfirmationOpen(false);}}/>
				{/*Error Message dialogue*/}
				<ActionModal actionOpen={errorOpen} actionTitle="Something went wrong..." actionText={reason}
							 actionBtnName="Report" handleActionBtnClick={() => console.log(reason)}
							 handleActionCancel={handleErrorCancel}/>
				<div className="inner-container">
					<Grid container spacing={4}>
						<Grid item xs={8}>
							<AppBar position="static" sx={{
								background: "#FFFFFF",
								boxShadow: "none",
							}}>
								{/*Tabs*/}
								<Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="dataset tabs">
									<Tab sx={tab} label="Files" {...a11yProps(0)} />
									<Tab sx={tab} label="Metadata" {...a11yProps(1)} disabled={true}/>
									<Tab sx={tab} label="Extractions" {...a11yProps(2)} disabled={true}/>
									<Tab sx={tab} label="Visualizations" {...a11yProps(3)} disabled={true}/>
									<Tab sx={tab} label="Comments" {...a11yProps(4)} disabled={true}/>
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
										sx={{
											padding: "6px 12px",
											width: "100px",
											background: "#6C757D",
											borderRadius: "4px",
											color: "white",
											textTransform: "capitalize",
											'&:hover': {
												color: "black"
											},
										}} endIcon={<ArrowDropDownIcon />}>
									Options
								</Button>
								<Menu
									id="simple-menu"
									anchorEl={anchorEl}
									keepMounted
									open={Boolean(anchorEl)}
									onClose={handleOptionClose}
								>
									<MenuItem sx={optionMenuItem}
											  onClick={()=>{
												  setOpen(true);
												  handleOptionClose();
											  }}>
										Add Files
									</MenuItem>
									<MenuItem sx={optionMenuItem}
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
										history("/");
									}
									} sx={optionMenuItem}>Delete Dataset</MenuItem>
									<MenuItem onClick={handleOptionClose} sx={optionMenuItem} disabled={true}>Follow</MenuItem>
									<MenuItem onClick={handleOptionClose} sx={optionMenuItem} disabled={true}>Collaborators</MenuItem>
									<MenuItem onClick={handleOptionClose} sx={optionMenuItem} disabled={true}>Extraction</MenuItem>
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
						<UploadFile selectedDatasetId={datasetId} setOpen={setOpen}/>
					</Dialog>
				</div>
			</div>
		</div>
	);
};
