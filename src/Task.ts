import * as tl from 'azure-pipelines-task-lib/task';
import {PackageService} from "./Services/PackageService";
import {AzureService} from "./Services/AzureService";
async function run() {
    try {
        let feedId: string = tl.getInput(
            "feed",
            true);
        tl.debug("Task.run - Feed id:" + feedId);

        let viewId: string = tl.getInput(
            "view",
            true);
        tl.debug("Task.run - View id:" + viewId);

        let packagePath: string = tl.getPathInput(
            "package",
            true,
            false);
        tl.debug("Task.run - Package path:" + packagePath);

        let packageService = new PackageService();
        let feedType = await packageService.getPackageProtocolType(feedId);

        if(!PackageService.isFeedTypeSupported(feedType))
            throw new Error("Feed type:" +feedType+" is not supported");

        let foundPackagePath: string = AzureService.expandPackageWildcardPatterns(packagePath);

        let packageDetails = packageService.getPackageDetailsFromPath(
            foundPackagePath,
            feedType);

        await packageService.promote(
            feedId,
            viewId,
            packageDetails,
            feedType);

        console.log("Successfully promoted packaged");
    }
    catch (error)
    {
        tl.setResult(
            tl.TaskResult.Failed,
            error.message);
    }
}

run();