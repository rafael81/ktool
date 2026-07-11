package com.kdocumenttool.pdf

import android.content.ContentResolver
import android.content.Intent
import android.net.Uri

interface UriGrantManager {
  fun persistReadAccess(uris: List<Uri>): Set<Uri>

  fun releaseReadAccess(uri: Uri)
}

class AndroidUriGrantManager(private val resolver: ContentResolver) : UriGrantManager {
  override fun persistReadAccess(uris: List<Uri>): Set<Uri> {
    val existing =
      runCatching {
          resolver.persistedUriPermissions
            .asSequence()
            .filter { permission -> permission.isReadPermission }
            .mapTo(mutableSetOf()) { permission -> permission.uri }
        }
        .getOrDefault(emptySet())
    return uris.filterTo(mutableSetOf()) { uri ->
      uri in existing ||
        runCatching {
            resolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION)
          }
          .isSuccess
    }
  }

  override fun releaseReadAccess(uri: Uri) {
    runCatching {
      resolver.releasePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
  }
}
