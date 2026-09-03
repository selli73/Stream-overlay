-- CreateTable
CREATE TABLE "StreamSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),

    CONSTRAINT "StreamSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackHistory" (
    "id" TEXT NOT NULL,
    "streamSessionId" TEXT NOT NULL,
    "trackTitle" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "spotifyTrackId" TEXT NOT NULL,
    "timeAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArtistToTrackHistory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ArtistToTrackHistory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "TrackHistory_streamSessionId_idx" ON "TrackHistory"("streamSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_name_key" ON "Artist"("name");

-- CreateIndex
CREATE INDEX "_ArtistToTrackHistory_B_index" ON "_ArtistToTrackHistory"("B");

-- AddForeignKey
ALTER TABLE "StreamSession" ADD CONSTRAINT "StreamSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackHistory" ADD CONSTRAINT "TrackHistory_streamSessionId_fkey" FOREIGN KEY ("streamSessionId") REFERENCES "StreamSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToTrackHistory" ADD CONSTRAINT "_ArtistToTrackHistory_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToTrackHistory" ADD CONSTRAINT "_ArtistToTrackHistory_B_fkey" FOREIGN KEY ("B") REFERENCES "TrackHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
